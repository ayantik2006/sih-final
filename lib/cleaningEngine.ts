export interface RawScrapePayload {
  raw_id?: string;
  source_site: string;
  route_text?: string;
  from?: string;
  to?: string;
  flight_identifier?: string;
  carrier_name?: string;
  departure_time_str?: string;
  scrape_timestamp?: string;
  lead_days?: number;
  cabin?: string;
  raw_base_price?: string | number;
  raw_taxes_udf?: string | number;
  convenience_charge?: string | number;
  raw_total_price?: string | number;
  currency_str?: string;
  seats_left_text?: string;
  flight_status?: string;
}

export interface CleanedFareRecord {
  record_id: string;
  origin: string;
  destination: string;
  carrier: string;
  flight_no: string;
  departure_date: string;
  scrape_date: string;
  advance_purchase_days: number;
  fare_class: 'Economy' | 'Premium Economy' | 'Business';
  base_fare: number;
  taxes: number;
  udf: number;
  convenience_fee: number;
  total_fare: number;
  seat_availability_flag: 'AVAILABLE' | 'FEW_SEATS_LEFT' | 'SOLD_OUT' | 'CANCELLED';
  is_duplicate: boolean;
  is_outlier: boolean;
  outlier_reason?: string;
  imputation_applied: boolean;
  imputed_fields: string[];
  z_score: number;
  iqr_status: 'NORMAL' | 'LOW_OUTLIER' | 'HIGH_OUTLIER';
  include_in_cpi_index: boolean;
}

export interface PipelineAuditSummary {
  total_raw_ingested: number;
  valid_cleaned_records: number;
  duplicates_merged: number;
  outliers_flagged: number;
  imputed_records_count: number;
  sold_out_excluded: number;
  cpi_eligible_records: number;
  data_quality_score_percent: number;
}

// Currency and string cleaner
export function parseRupeeAmount(val: string | number | undefined | null): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = val.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed);
}

// Extract origin and destination
export function normalizeAirportCode(code: string | undefined): string {
  if (!code) return 'DEL';
  const upper = code.trim().toUpperCase();
  if (upper.includes('DEL') || upper.includes('DELHI')) return 'DEL';
  if (upper.includes('BOM') || upper.includes('MUMBAI')) return 'BOM';
  if (upper.includes('BLR') || upper.includes('BENGALURU') || upper.includes('BANGALORE')) return 'BLR';
  if (upper.includes('CCU') || upper.includes('KOLKATA')) return 'CCU';
  if (upper.includes('HYD') || upper.includes('HYDERABAD')) return 'HYD';
  if (upper.includes('MAA') || upper.includes('CHENNAI')) return 'MAA';
  return upper.slice(0, 3);
}

// Seat availability detector
export function parseAvailability(statusText?: string): 'AVAILABLE' | 'FEW_SEATS_LEFT' | 'SOLD_OUT' | 'CANCELLED' {
  if (!statusText) return 'AVAILABLE';
  const lower = statusText.toLowerCase();
  if (lower.includes('cancel') || lower.includes('cancelled')) return 'CANCELLED';
  if (lower.includes('sold out') || lower.includes('0 seat') || lower.includes('full')) return 'SOLD_OUT';
  if (lower.includes('few') || lower.includes('left') || lower.includes('last')) return 'FEW_SEATS_LEFT';
  return 'AVAILABLE';
}

// Main Cleaning & Normalization Pipeline Function
export function runDataCleaningPipeline(rawPayloads: RawScrapePayload[]): {
  cleanedRecords: CleanedFareRecord[];
  auditSummary: PipelineAuditSummary;
} {
  const seenFingerprints = new Set<string>();
  const initialRecords: CleanedFareRecord[] = [];
  let duplicatesCount = 0;
  let imputedCount = 0;

  // Step 1: Parsing & Normalization
  for (let i = 0; i < rawPayloads.length; i++) {
    const raw = rawPayloads[i];
    const origin = normalizeAirportCode(raw.from || raw.route_text?.split('-')[0]);
    const destination = normalizeAirportCode(raw.to || raw.route_text?.split('-')[1]);
    const carrier = raw.carrier_name || 'IndiGo';
    const flight_no = raw.flight_identifier || `${carrier.slice(0, 2).toUpperCase()}-${100 + i}`;
    const advance_purchase_days = raw.lead_days !== undefined ? raw.lead_days : 7;
    const departure_date = raw.departure_time_str ? raw.departure_time_str.split('T')[0] : '2026-09-20';
    const scrape_date = raw.scrape_timestamp ? raw.scrape_timestamp.split('T')[0] : '2026-09-14';

    // Unique fingerprint for de-duplication
    const fingerprint = `${origin}_${destination}_${carrier}_${flight_no}_${departure_date}_${advance_purchase_days}`;
    const is_duplicate = seenFingerprints.has(fingerprint);
    if (is_duplicate) {
      duplicatesCount++;
    } else {
      seenFingerprints.add(fingerprint);
    }

    let base_fare = parseRupeeAmount(raw.raw_base_price);
    let taxes = parseRupeeAmount(raw.raw_taxes_udf);
    let total_fare = parseRupeeAmount(raw.raw_total_price);
    const convenience_fee = parseRupeeAmount(raw.convenience_charge) || 350;
    const udf = Math.round(taxes * 0.45) || 280;

    const imputed_fields: string[] = [];
    let imputation_applied = false;

    // Missing Value Imputation (carry-forward/route-level reconstruction)
    if (total_fare === 0 && base_fare > 0) {
      if (taxes === 0) taxes = Math.round(base_fare * 0.18) + 400;
      total_fare = base_fare + taxes + convenience_fee;
      imputed_fields.push('total_fare');
      imputation_applied = true;
    } else if (base_fare === 0 && total_fare > 0) {
      taxes = Math.round(total_fare * 0.15) + 300;
      base_fare = Math.max(1200, total_fare - taxes - convenience_fee);
      imputed_fields.push('base_fare');
      imputation_applied = true;
    } else if (total_fare === 0 && base_fare === 0) {
      // Default corridor baseline imputation
      base_fare = 3800;
      taxes = 650;
      total_fare = 4800;
      imputed_fields.push('base_fare', 'taxes', 'total_fare');
      imputation_applied = true;
    }

    if (imputation_applied) imputedCount++;

    const seat_availability_flag = parseAvailability(raw.seats_left_text || raw.flight_status);

    initialRecords.push({
      record_id: `CLN-${origin}-${destination}-${1000 + i}`,
      origin,
      destination,
      carrier,
      flight_no,
      departure_date,
      scrape_date,
      advance_purchase_days,
      fare_class: raw.cabin === 'Business' ? 'Business' : 'Economy',
      base_fare,
      taxes,
      udf,
      convenience_fee,
      total_fare,
      seat_availability_flag,
      is_duplicate,
      is_outlier: false,
      imputation_applied,
      imputed_fields,
      z_score: 0,
      iqr_status: 'NORMAL',
      include_in_cpi_index: true,
    });
  }

  // Step 2: Route-Window Grouping for IQR & Z-score Outlier Detection
  const routeGroups = new Map<string, CleanedFareRecord[]>();
  initialRecords.forEach((rec) => {
    const key = `${rec.origin}-${rec.destination}-${rec.advance_purchase_days}`;
    if (!routeGroups.has(key)) routeGroups.set(key, []);
    routeGroups.get(key)!.push(rec);
  });

  let outliersCount = 0;
  let soldOutCount = 0;

  routeGroups.forEach((group) => {
    const fares = group.map((r) => r.total_fare).sort((a, b) => a - b);
    if (fares.length === 0) return;

    // IQR Calculation
    const q1Index = Math.floor(fares.length * 0.25);
    const q3Index = Math.floor(fares.length * 0.75);
    const q1 = fares[q1Index];
    const q3 = fares[q3Index];
    const iqr = Math.max(500, q3 - q1);
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Mean and Standard Deviation for Z-Score
    const mean = fares.reduce((a, b) => a + b, 0) / fares.length;
    const variance = fares.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / fares.length;
    const stdDev = Math.max(200, Math.sqrt(variance));

    group.forEach((rec) => {
      const zScore = parseFloat(((rec.total_fare - mean) / stdDev).toFixed(2));
      rec.z_score = zScore;

      // Check IQR
      if (rec.total_fare < lowerBound) {
        rec.iqr_status = 'LOW_OUTLIER';
        rec.is_outlier = true;
        rec.outlier_reason = `Low outlier: ₹${rec.total_fare} < lower threshold ₹${Math.round(lowerBound)}`;
        outliersCount++;
      } else if (rec.total_fare > upperBound) {
        rec.iqr_status = 'HIGH_OUTLIER';
        rec.is_outlier = true;
        rec.outlier_reason = `High outlier / fare surge: ₹${rec.total_fare} > upper threshold ₹${Math.round(upperBound)}`;
        outliersCount++;
      } else if (Math.abs(zScore) > 2.5) {
        rec.is_outlier = true;
        rec.outlier_reason = `Z-score anomaly (${zScore} > 2.5 standard deviations)`;
        outliersCount++;
      }

      // Check Sold Out / Cancelled
      if (rec.seat_availability_flag === 'SOLD_OUT' || rec.seat_availability_flag === 'CANCELLED') {
        soldOutCount++;
      }

      // Exclude from CPI index if duplicate, outlier, sold-out, or cancelled
      rec.include_in_cpi_index = !rec.is_duplicate && !rec.is_outlier && rec.seat_availability_flag !== 'SOLD_OUT' && rec.seat_availability_flag !== 'CANCELLED';
    });
  });

  const cpiEligible = initialRecords.filter((r) => r.include_in_cpi_index).length;
  const qualityScore = Math.round((cpiEligible / Math.max(1, initialRecords.length)) * 100);

  return {
    cleanedRecords: initialRecords,
    auditSummary: {
      total_raw_ingested: rawPayloads.length,
      valid_cleaned_records: initialRecords.length,
      duplicates_merged: duplicatesCount,
      outliers_flagged: outliersCount,
      imputed_records_count: imputedCount,
      sold_out_excluded: soldOutCount,
      cpi_eligible_records: cpiEligible,
      data_quality_score_percent: qualityScore,
    },
  };
}

export const SAMPLE_RAW_BATCH: RawScrapePayload[] = [
  {
    raw_id: 'RAW_01',
    source_site: 'MakeMyTrip Scraper',
    from: 'DELHI (DEL)',
    to: 'MUMBAI (BOM)',
    flight_identifier: '6E-2051',
    carrier_name: 'IndiGo',
    departure_time_str: '2026-09-21T08:30:00Z',
    scrape_timestamp: '2026-09-14T02:00:00Z',
    lead_days: 7,
    cabin: 'Economy',
    raw_base_price: '₹3,800.00',
    raw_taxes_udf: 'INR 650',
    convenience_charge: '350',
    raw_total_price: '₹4,800',
    seats_left_text: '9 seats available',
    flight_status: 'Scheduled',
  },
  {
    raw_id: 'RAW_02_DUP',
    source_site: 'IndiGo Direct HTML',
    from: 'DEL',
    to: 'BOM',
    flight_identifier: '6E-2051',
    carrier_name: 'IndiGo',
    departure_time_str: '2026-09-21T08:30:00Z',
    scrape_timestamp: '2026-09-14T02:05:00Z',
    lead_days: 7,
    cabin: 'Economy',
    raw_base_price: '3800',
    raw_taxes_udf: '650',
    convenience_charge: '350',
    raw_total_price: '4800',
    seats_left_text: 'Available',
    flight_status: 'On Time',
  },
  {
    raw_id: 'RAW_03_OUTLIER',
    source_site: 'OTA Fare Calendar',
    from: 'DEL',
    to: 'BOM',
    flight_identifier: 'AI-805',
    carrier_name: 'Air India',
    departure_time_str: '2026-09-21T09:00:00Z',
    scrape_timestamp: '2026-09-14T02:00:00Z',
    lead_days: 7,
    cabin: 'Economy',
    raw_base_price: '₹28,500',
    raw_taxes_udf: '₹3,200',
    convenience_charge: '400',
    raw_total_price: '₹32,100',
    seats_left_text: '1 seat left at this price',
    flight_status: 'Surge Pricing',
  },
  {
    raw_id: 'RAW_04_MISSING',
    source_site: 'EaseMyTrip Web',
    from: 'DELHI',
    to: 'BENGALURU',
    flight_identifier: 'SG-8182',
    carrier_name: 'SpiceJet',
    departure_time_str: '2026-09-21T11:15:00Z',
    scrape_timestamp: '2026-09-14T02:00:00Z',
    lead_days: 7,
    cabin: 'Economy',
    raw_base_price: '',
    raw_taxes_udf: '',
    convenience_charge: '',
    raw_total_price: '₹3,900',
    seats_left_text: 'Available',
    flight_status: 'Scheduled',
  },
  {
    raw_id: 'RAW_05_SOLDOUT',
    source_site: 'Akasa Air Direct',
    from: 'BLR',
    to: 'HYD',
    flight_identifier: 'QP-1304',
    carrier_name: 'Akasa Air',
    departure_time_str: '2026-09-21T14:45:00Z',
    scrape_timestamp: '2026-09-14T02:00:00Z',
    lead_days: 7,
    cabin: 'Economy',
    raw_base_price: '2200',
    raw_taxes_udf: '400',
    convenience_charge: '300',
    raw_total_price: '2900',
    seats_left_text: 'SOLD OUT - 0 seats',
    flight_status: 'Fully Booked',
  },
  {
    raw_id: 'RAW_06_NORMAL',
    source_site: 'Cleartrip',
    from: 'BOM',
    to: 'BLR',
    flight_identifier: 'IX-245',
    carrier_name: 'Air India Express',
    departure_time_str: '2026-09-21T16:00:00Z',
    scrape_timestamp: '2026-09-14T02:00:00Z',
    lead_days: 7,
    cabin: 'Economy',
    raw_base_price: '2900',
    raw_taxes_udf: '450',
    convenience_charge: '300',
    raw_total_price: '3650',
    seats_left_text: '4 seats left',
    flight_status: 'Available',
  },
];
