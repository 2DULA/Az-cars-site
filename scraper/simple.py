"""
Lightweight auction listing scraper for the ahsellcar API.

Only hits entry/list/paging -- fast, cheap, safe to run 1-2x/day.
Per-car detail (inspection report, frame damage, images) is NOT fetched
here; that happens on-demand when a user opens a car's detail page
(see the separate fetch-on-click API route).

Requires: pip install psycopg2-binary requests --break-system-packages
Env var required: SUPABASE_DB_URL
"""

import os
import re
import requests
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime, timezone, timedelta

DB_URL = os.environ["SUPABASE_DB_URL"]

AUTH_BASE = "https://api.ahsellcar.co.kr/auth/external/rest/api/v1"
AUCTION_BASE = "https://api.ahsellcar.co.kr/auction/external/rest/api/v1"


# ---------------------------------------------------------------------------
# Token handling (self-refresh -- still needed since the listing call
# itself requires a valid access token)
# ---------------------------------------------------------------------------

def get_stored_auth(conn):
    with conn.cursor() as cur:
        cur.execute(
            "select access_token, refresh_token, access_token_expires_at "
            "from scraper_auth where id = true"
        )
        row = cur.fetchone()
        if not row:
            raise RuntimeError(
                "No row in scraper_auth. Run the one-time manual login "
                "and insert the first token pair before running the scraper."
            )
        return {"access_token": row[0], "refresh_token": row[1], "expires_at": row[2]}


def save_auth(conn, access_token, refresh_token, expires_at):
    with conn.cursor() as cur:
        cur.execute(
            """
            update scraper_auth
            set access_token = %s, refresh_token = %s,
                access_token_expires_at = %s, updated_at = now()
            where id = true
            """,
            (access_token, refresh_token, expires_at),
        )
    conn.commit()


def refresh_token(conn, current_refresh_token):
    resp = requests.post(
        f"{AUTH_BASE}/auth/refresh",
        json={"refreshToken": current_refresh_token},
    )
    resp.raise_for_status()
    data = resp.json()

    # NOTE: confirm these keys against the real refresh response the first
    # time this runs -- adjust here if the actual shape differs.
    new_access = data.get("accessToken") or data.get("access_token")
    new_refresh = data.get("refreshToken") or data.get("refresh_token")

    if not new_access or not new_refresh:
        raise RuntimeError(f"Unexpected refresh response shape: {data}")

    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    save_auth(conn, new_access, new_refresh, expires_at)
    print("Token refreshed successfully.")
    return new_access


def ensure_valid_token(conn):
    auth = get_stored_auth(conn)
    now = datetime.now(timezone.utc)
    if auth["expires_at"] <= now + timedelta(hours=1):
        print("Access token expiring soon or expired, refreshing...")
        return refresh_token(conn, auth["refresh_token"])
    return auth["access_token"]


# ---------------------------------------------------------------------------
# Cleaning helpers
# ---------------------------------------------------------------------------

def clean_int(value):
    if value is None:
        return None
    digits = re.sub(r"[^\d]", "", str(value))
    return int(digits) if digits else None


def parse_ymd(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y%m%d").date()
    except ValueError:
        return None


def parse_ymdhms(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y%m%d%H%M%S")
    except ValueError:
        return None


# ---------------------------------------------------------------------------
# API call
# ---------------------------------------------------------------------------

def fetch_entry_list(access_token, page_index=1, page_size=2060):
    resp = requests.post(
        f"{AUCTION_BASE}/entry/list/paging",
        json={
            "tenant": "1",
            "pageSize": page_size,
            "pageIndex": page_index,
            "sort": "desc",
            "sortBy": "entryNo",
        },
        headers={"Authorization": f"Bearer {access_token}"},
    )
    resp.raise_for_status()
    return resp.json()["data"]


# ---------------------------------------------------------------------------
# DB upsert (lightweight fields only -- listing response, not detail/info)
# ---------------------------------------------------------------------------

def upsert_listing_entries(conn, entries):
    with conn.cursor() as cur:
        execute_values(
            cur,
            """
            insert into cars (
                source, status, source_id, provider_car_id, perf_id,
                model, model_ko, plate_no, year, fuel, transmission,
                mileage_km, start_amt, bid_succ_amt, bid_fail_yn,
                auction_date, auction_start_at, auction_status,
                lane_code, lane_name, inspection_grade, accident_tag,
                thumbnail_url
            )
            values %s
            on conflict (source_id) do update set
                provider_car_id = excluded.provider_car_id,
                perf_id = excluded.perf_id,
                model = excluded.model,
                model_ko = excluded.model_ko,
                plate_no = excluded.plate_no,
                year = excluded.year,
                fuel = excluded.fuel,
                transmission = excluded.transmission,
                mileage_km = excluded.mileage_km,
                start_amt = excluded.start_amt,
                bid_succ_amt = excluded.bid_succ_amt,
                bid_fail_yn = excluded.bid_fail_yn,
                auction_date = excluded.auction_date,
                auction_start_at = excluded.auction_start_at,
                auction_status = excluded.auction_status,
                lane_code = excluded.lane_code,
                lane_name = excluded.lane_name,
                inspection_grade = excluded.inspection_grade,
                accident_tag = excluded.accident_tag,
                thumbnail_url = excluded.thumbnail_url,
                status = 'active'
            """,
            [
                (
                    'auction', 'active', e["entryId"], e.get(
                        "carId"), e.get("perfId"),
                    e.get("carNmEn"), e.get("carNmKo"), e.get("carNo"),
                    clean_int(e.get("carYear")), e.get(
                        "fuelNmEn"), e.get("tmNmEn"),
                    clean_int(e.get("mileage")), e.get(
                        "startAmt"), e.get("bidSuccAmt"),
                    e.get("bidFailYn") == "Y",
                    parse_ymd(e.get("aucDate")), parse_ymdhms(
                        e.get("aucStartPlanDate")),
                    e.get("aucStatusGrpNmEn"), e.get(
                        "aucLaneCode"), e.get("laneNmEn"),
                    e.get("inspGrade"), e.get("accidentTag"),
                    e.get("mainFileUrl"),
                )
                for e in entries
            ],
        )
    conn.commit()


def mark_ended_auctions(conn, seen_source_ids):
    with conn.cursor() as cur:
        cur.execute(
            """
            update cars set status = 'ended'
            where source = 'auction' and status = 'active'
            and source_id != all(%s)
            """,
            (list(seen_source_ids),),
        )
    conn.commit()


# ---------------------------------------------------------------------------
# Main run
# ---------------------------------------------------------------------------

def run():
    conn = psycopg2.connect(DB_URL)
    access_token = ensure_valid_token(conn)

    listing = fetch_entry_list(access_token)
    entries = listing["list"]
    total_rows = listing["totalRows"]
    total_pages = listing["totalPages"]
    print(
        f"Fetched {len(entries)} of {total_rows} total entries (page 1 of {total_pages})")

    # Only paginate if the server actually caps pageSize below what we asked for.
    for page in range(2, total_pages + 1):
        more = fetch_entry_list(access_token, page_index=page)
        entries.extend(more["list"])
        print(f"Fetched page {page} of {total_pages}")

    upsert_listing_entries(conn, entries)
    mark_ended_auctions(conn, [e["entryId"] for e in entries])

    print(f"Done. Upserted {len(entries)} listings.")
    conn.close()


if __name__ == "__main__":
    run()
