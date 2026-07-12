import requests
from bs4 import BeautifulSoup
import json
import time

BASE_URL = "https://general-cars.com"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ar,en;q=0.9",
}


def bilingual_text(el, lang="ar"):
    if not el:
        return None
    return el.get(f"data-lang-{lang}") or el.get_text(strip=True)


def parse_card(card):
    make_el = card.select_one(".gl-list-card-make")
    make_spans = make_el.select("span.bilingual") if make_el else []
    brand = bilingual_text(make_spans[0]) if len(make_spans) > 0 else None
    fuel = bilingual_text(make_spans[1]) if len(make_spans) > 1 else None

    name_el = card.select_one(".gl-list-card-name span.bilingual")
    model = bilingual_text(name_el)

    trim_el = card.select_one(".gl-list-card-trim")
    trim = trim_el.get_text(strip=True) if trim_el else None

    price_el = card.select_one(".gl-list-card-price")
    price_krw = price_el.get("data-price-krw") if price_el else None

    chips = card.select(
        ".gl-list-card-meta .gl-chip .bilingual, .gl-list-card-meta .gl-chip span[dir='ltr']"
    )
    chip_texts = [c.get_text(strip=True) for c in chips]
    mileage = chip_texts[0] if len(chip_texts) > 0 else None
    transmission = chip_texts[1] if len(chip_texts) > 1 else None
    engine = chip_texts[2] if len(chip_texts) > 2 else None

    img_el = card.select_one(".gl-list-card-img img")
    image = None
    if img_el:
        image = img_el.get("src") or img_el.get("data-src")

    countdown_el = card.select_one(".auction-countdown")
    auction_date = countdown_el.get(
        "data-auction-date") if countdown_el else None

    return {
        "url": BASE_URL + card.get("href", ""),
        "brand": brand,
        "model": model,
        "trim": trim,
        "fuel": fuel,
        "price_krw": price_krw,
        "mileage": mileage,
        "transmission": transmission,
        "engine": engine,
        "image": image,
        "auction_date": auction_date,
    }


def scrape_auctions(max_pages=50):
    results = []
    seen_urls = set()
    page = 1

    while page <= max_pages:
        url = f"{BASE_URL}/cars/?car_type=auction&page={page}"
        resp = requests.get(url, headers=HEADERS)
        print(f"Page {page}: status {resp.status_code}")

        if resp.status_code != 200:
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("a.gl-list-card")

        if not cards:
            break

        parsed = [parse_card(c) for c in cards]
        new_items = [p for p in parsed if p["url"] not in seen_urls]

        if not new_items:
            print(f"Page {page}: all duplicates, stopping")
            break

        for item in new_items:
            seen_urls.add(item["url"])
        results.extend(new_items)

        print(f"Page {page}: {len(new_items)} new listings")
        page += 1
        time.sleep(5)

    return results


if __name__ == "__main__":
    data = scrape_auctions()
    with open("auctions.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(data)} unique listings")
