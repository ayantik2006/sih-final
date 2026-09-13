export interface AirfareRecord {
  id: string;
  date: string;
  route: string;
  origin: string;
  destination: string;
  airline: string;
  bookingWindow: string; // T+1, T+7, T+15, T+30, T+45
  baseFare: number;
  tax: number;
  totalFare: number;
  scrapedAt: string;
  source: string;
}

export interface IndexPoint {
  date: string;
  apixValue: number; // base 100
  dgcaBenchmark: number;
  minFare: number;
  maxFare: number;
  avgFare: number;
  changeMoM: number;
}

export interface ScraperLogItem {
  id: string;
  source: string;
  type: 'Airline' | 'OTA';
  route: string;
  status: 'SUCCESS' | 'RATE_LIMITED' | 'RETRYING' | 'BLOCKED_QUEUE';
  recordsScraped: number;
  responseTimeMs: number;
  timestamp: string;
  complianceNote: string;
}

export const INITIAL_INDEX_DATA: IndexPoint[] = [
  { date: 'Aug 15', apixValue: 98.2, dgcaBenchmark: 97.8, minFare: 3100, maxFare: 8200, avgFare: 4420, changeMoM: -0.4 },
  { date: 'Aug 18', apixValue: 98.9, dgcaBenchmark: 98.4, minFare: 3150, maxFare: 8350, avgFare: 4480, changeMoM: -0.1 },
  { date: 'Aug 21', apixValue: 99.4, dgcaBenchmark: 99.0, minFare: 3200, maxFare: 8400, avgFare: 4510, changeMoM: +0.2 },
  { date: 'Aug 24', apixValue: 100.1, dgcaBenchmark: 99.8, minFare: 3220, maxFare: 8450, avgFare: 4590, changeMoM: +0.5 },
  { date: 'Aug 27', apixValue: 100.8, dgcaBenchmark: 100.3, minFare: 3250, maxFare: 8600, avgFare: 4630, changeMoM: +0.8 },
  { date: 'Aug 30', apixValue: 101.2, dgcaBenchmark: 100.9, minFare: 3280, maxFare: 8650, avgFare: 4680, changeMoM: +1.0 },
  { date: 'Sep 02', apixValue: 101.5, dgcaBenchmark: 101.1, minFare: 3300, maxFare: 8700, avgFare: 4720, changeMoM: +1.1 },
  { date: 'Sep 05', apixValue: 101.9, dgcaBenchmark: 101.4, minFare: 3320, maxFare: 8750, avgFare: 4760, changeMoM: +1.3 },
  { date: 'Sep 08', apixValue: 102.1, dgcaBenchmark: 101.8, minFare: 3350, maxFare: 8800, avgFare: 4800, changeMoM: +1.4 },
  { date: 'Sep 11', apixValue: 102.3, dgcaBenchmark: 102.0, minFare: 3380, maxFare: 8850, avgFare: 4830, changeMoM: +1.5 },
  { date: 'Sep 14', apixValue: 102.45, dgcaBenchmark: 102.1, minFare: 3400, maxFare: 8900, avgFare: 4850, changeMoM: +1.2 },
];

export const POPULAR_ROUTES = [
  { code: 'DEL-BOM', name: 'Delhi ↔ Mumbai', price: 4450, dgcaWeight: 0.18, volume: '2.4M/mo', trend: '+1.4%' },
  { code: 'DEL-BLR', name: 'Delhi ↔ Bengaluru', price: 3900, dgcaWeight: 0.14, volume: '1.9M/mo', trend: '+0.8%' },
  { code: 'BOM-BLR', name: 'Mumbai ↔ Bengaluru', price: 3650, dgcaWeight: 0.12, volume: '1.6M/mo', trend: '-0.3%' },
  { code: 'DEL-CCU', name: 'Delhi ↔ Kolkata', price: 2850, dgcaWeight: 0.09, volume: '1.2M/mo', trend: '+1.9%' },
  { code: 'BLR-HYD', name: 'Bengaluru ↔ Hyderabad', price: 2200, dgcaWeight: 0.08, volume: '1.1M/mo', trend: '-0.5%' },
  { code: 'MAA-DEL', name: 'Chennai ↔ Delhi', price: 4100, dgcaWeight: 0.07, volume: '0.9M/mo', trend: '+1.1%' },
];

export const AIRLINE_COMPARISON = [
  { name: 'IndiGo', avgPrice: 4200, marketShare: '62%', reliability: '99.4%', color: '#003f87' },
  { name: 'Air India', avgPrice: 5100, marketShare: '15%', reliability: '98.8%', color: '#dc2626' },
  { name: 'SpiceJet', avgPrice: 3800, marketShare: '9%', reliability: '96.2%', color: '#ea580c' },
  { name: 'Akasa Air', avgPrice: 3950, marketShare: '8%', reliability: '99.1%', color: '#7c3aed' },
  { name: 'Air India Express', avgPrice: 4050, marketShare: '6%', reliability: '97.9%', color: '#0284c7' },
];

export const ELASTICITY_DATA = [
  { window: 'T+1', avgFare: 8100, label: '1 Day (Last Minute)' },
  { window: 'T+7', avgFare: 5400, label: '7 Days Advance' },
  { window: 'T+15', avgFare: 3800, label: '15 Days Advance' },
  { window: 'T+30', avgFare: 3400, label: '30 Days Advance' },
  { window: 'T+45', avgFare: 3200, label: '45 Days Advance' },
];

export const HEATMAP_DATA = [
  { route: 'DEL-BOM', t1: 8900, t7: 5800, t15: 4450, t30: 3900, t45: 3600 },
  { route: 'DEL-BLR', t1: 8200, t7: 5200, t15: 3900, t30: 3500, t45: 3300 },
  { route: 'BOM-BLR', t1: 7100, t7: 4600, t15: 3650, t30: 3200, t45: 3000 },
  { route: 'DEL-CCU', t1: 6500, t7: 4100, t15: 2850, t30: 2600, t45: 2400 },
  { route: 'BLR-HYD', t1: 5200, t7: 3300, t15: 2200, t30: 2000, t45: 1900 },
  { route: 'MAA-DEL', t1: 8400, t7: 5500, t15: 4100, t30: 3700, t45: 3500 },
];

export const MOCK_RAW_FARES: AirfareRecord[] = [
  { id: 'F101', date: '2026-09-14', route: 'DEL-BOM', origin: 'DEL', destination: 'BOM', airline: 'IndiGo', bookingWindow: 'T+7', baseFare: 3800, tax: 650, totalFare: 4450, scrapedAt: '10:14:02 AM', source: 'IndiGo Direct' },
  { id: 'F102', date: '2026-09-14', route: 'DEL-BOM', origin: 'DEL', destination: 'BOM', airline: 'SpiceJet', bookingWindow: 'T+7', baseFare: 3200, tax: 480, totalFare: 3680, scrapedAt: '10:14:05 AM', source: 'MakeMyTrip' },
  { id: 'F103', date: '2026-09-14', route: 'DEL-BOM', origin: 'DEL', destination: 'BOM', airline: 'Air India', bookingWindow: 'T+7', baseFare: 4500, tax: 675, totalFare: 5175, scrapedAt: '10:14:10 AM', source: 'AirIndia.com' },
  { id: 'F104', date: '2026-09-14', route: 'DEL-BLR', origin: 'DEL', destination: 'BLR', airline: 'IndiGo', bookingWindow: 'T+15', baseFare: 3300, tax: 600, totalFare: 3900, scrapedAt: '10:14:12 AM', source: 'IndiGo Direct' },
  { id: 'F105', date: '2026-09-14', route: 'DEL-BLR', origin: 'DEL', destination: 'BLR', airline: 'Akasa Air', bookingWindow: 'T+15', baseFare: 3100, tax: 550, totalFare: 3650, scrapedAt: '10:14:15 AM', source: 'EaseMyTrip' },
  { id: 'F106', date: '2026-09-14', route: 'BOM-BLR', origin: 'BOM', destination: 'BLR', airline: 'Air India Express', bookingWindow: 'T+30', baseFare: 2800, tax: 450, totalFare: 3250, scrapedAt: '10:14:20 AM', source: 'Cleartrip' },
  { id: 'F107', date: '2026-09-13', route: 'DEL-CCU', origin: 'DEL', destination: 'CCU', airline: 'SpiceJet', bookingWindow: 'T+7', baseFare: 2400, tax: 450, totalFare: 2850, scrapedAt: '09:30:11 AM', source: 'Yatra' },
  { id: 'F108', date: '2026-09-13', route: 'BLR-HYD', origin: 'BLR', destination: 'HYD', airline: 'IndiGo', bookingWindow: 'T+45', baseFare: 1800, tax: 400, totalFare: 2200, scrapedAt: '09:30:15 AM', source: 'IndiGo Direct' },
  { id: 'F109', date: '2026-09-13', route: 'MAA-DEL', origin: 'MAA', destination: 'DEL', airline: 'Air India', bookingWindow: 'T+1', baseFare: 7400, tax: 1000, totalFare: 8400, scrapedAt: '09:30:20 AM', source: 'Ixigo' },
  { id: 'F110', date: '2026-09-13', route: 'DEL-BOM', origin: 'DEL', destination: 'BOM', airline: 'Akasa Air', bookingWindow: 'T+1', baseFare: 7100, tax: 950, totalFare: 8050, scrapedAt: '09:30:25 AM', source: 'EaseMyTrip' },
];

export const SCRAPER_LOGS: ScraperLogItem[] = [
  { id: 'SCR-901', source: 'IndiGo Booking API / Web', type: 'Airline', route: 'DEL-BOM', status: 'SUCCESS', recordsScraped: 142, responseTimeMs: 420, timestamp: '10:14:02 AM', complianceNote: 'Robots.txt compliant, Crawl-delay: 2s' },
  { id: 'SCR-902', source: 'MakeMyTrip Search Engine', type: 'OTA', route: 'DEL-BLR', status: 'SUCCESS', recordsScraped: 210, responseTimeMs: 650, timestamp: '10:14:05 AM', complianceNote: 'Affiliate API token used, rate-limited' },
  { id: 'SCR-903', source: 'Air India Direct Engine', type: 'Airline', route: 'BOM-BLR', status: 'SUCCESS', recordsScraped: 98, responseTimeMs: 510, timestamp: '10:14:10 AM', complianceNote: 'Headless Playwright session rotated' },
  { id: 'SCR-904', source: 'SpiceJet Public Booking', type: 'Airline', route: 'DEL-CCU', status: 'RATE_LIMITED', recordsScraped: 0, responseTimeMs: 1200, timestamp: '10:13:40 AM', complianceNote: 'Throttled (429), retry queued in 15m' },
  { id: 'SCR-905', source: 'EaseMyTrip Listing', type: 'OTA', route: 'BLR-HYD', status: 'SUCCESS', recordsScraped: 175, responseTimeMs: 390, timestamp: '10:12:00 AM', complianceNote: 'Partner API read-only endpoint' },
  { id: 'SCR-906', source: 'Akasa Air Engine', type: 'Airline', route: 'MAA-DEL', status: 'BLOCKED_QUEUE', recordsScraped: 0, responseTimeMs: 2100, timestamp: '10:10:15 AM', complianceNote: 'CAPTCHA barrier detected, fallback queue' },
];
