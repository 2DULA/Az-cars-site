// Types mirroring the Carapis vehicle schema
// https://my.carapis.com/apidocs

export interface Photo {
  url: string;
  thumb_url: string;
  original_url: string;
  is_main: boolean;
  photo_type: string;
  position: number;
  width: number;
  height: number;
}

export interface SourceLocation {
  iso2: string;
  country_name: string;
  country_emoji: string;
  latitude: number;
  longitude: number;
  region_text: string;
}

export interface ValuationAnalysis {
  price_status: string;
  is_undervalued: boolean;
  percentile_rank: number;
  market_delta_pct: number;
  estimated_price?: number;
  price_low?: number;
  price_high?: number;
  confidence?: number;
  actual_price?: number;
  price_difference?: number;
  price_difference_pct?: number;
  comparable_count?: number;
  cohort_min_price?: number;
  cohort_max_price?: number;
  cohort_median_price?: number;
  breakdown?: {
    base_price?: string;
    year_impact?: string;
    mileage_impact?: string;
    options_impact?: string;
  };
  analysis_updated_at?: string;
}

// Shape returned by the listings endpoint (lighter weight)
export interface VehicleSummary {
  id: string;
  source_code: string;
  brand_name: string;
  brand_slug: string;
  model_name: string;
  model_slug: string;
  trim: string;
  year: number;
  price_usd: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  seller_type: string;
  region: string;
  source_location: SourceLocation;
  has_accident: boolean;
  is_new_vehicle: boolean;
  is_verified: boolean;
  first_seen_at: string;
  last_seen_at: string;
  thumb: Photo;
  photos: Photo[];
  photos_count: number;
  has_valuation: boolean;
  has_llm_analysis: boolean;
  analysis: ValuationAnalysis;
}

// Shape returned by the single-vehicle detail endpoint (full detail)
export interface VehicleDetail extends VehicleSummary {
  generation: string;
  price_original: string;
  price_original_currency: string;
  original_msrp: string;
  engine_cc: number;
  seat_count: number;
  drive_type: string;
  has_simple_repair: boolean;
  has_recall: boolean;
  recall_fulfilled: boolean;
  warranty_type: string;
  inspection_passed: boolean;
  owner_count: number;
  is_undervalued: boolean;
  valuation_score: number;
  features: string[];
  description: string;
  listing_url: string;
  listing_id: string;
  vin: string;
  vehicle_no: string;
  is_available: boolean;
  availability_checked_at: string;
  status_changed_at: string;
}

export interface PaginatedVehicles {
  count: number;
  page: number;
  pages: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
  results: VehicleSummary[];
}

// Filters a user can apply on the listings page — mirrors the real API's query params
export interface VehicleFilters {
  search?: string;
  brand?: string;
  model?: string;
  body_type?: string;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  min_mileage?: number;
  max_mileage?: number;
  has_accident?: boolean;
  inspection_passed?: boolean;
  is_new_vehicle?: boolean;
  is_undervalued?: boolean;
  available_only?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}
