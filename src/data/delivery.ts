import { Currency } from '../types';

export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  basePrice: number;
  pricePerKg: number;
  pricePerKm: number;
  estimatedMinutes: number;
  sameDay: boolean;
  color: string;
}

export interface CityPricing {
  city: string;
  country: string;
  lat: number;
  lng: number;
  zones: DeliveryZone[];
  standardDelivery: number;
  expressDelivery: number;
  sameDayAvailable: boolean;
  currency: string;
}

// ─── Nairobi Zones (Detailed) ──────────────────────────────────────────────

const NAIROBI_ZONES: DeliveryZone[] = [
  { id: 'nbi-cbd', name: 'CBD', city: 'Nairobi', country: 'Kenya', lat: -1.2864, lng: 36.8172, basePrice: 150, pricePerKg: 20, pricePerKm: 15, estimatedMinutes: 30, sameDay: true, color: '#007AFF' },
  { id: 'nbi-westlands', name: 'Westlands', city: 'Nairobi', country: 'Kenya', lat: -1.2674, lng: 36.8031, basePrice: 200, pricePerKg: 25, pricePerKm: 18, estimatedMinutes: 35, sameDay: true, color: '#30D158' },
  { id: 'nbi-karen', name: 'Karen', city: 'Nairobi', country: 'Kenya', lat: -1.3200, lng: 36.7100, basePrice: 350, pricePerKg: 35, pricePerKm: 25, estimatedMinutes: 50, sameDay: true, color: '#FF9500' },
  { id: 'nbi-lavington', name: 'Lavington', city: 'Nairobi', country: 'Kenya', lat: -1.2780, lng: 36.7730, basePrice: 250, pricePerKg: 28, pricePerKm: 20, estimatedMinutes: 40, sameDay: true, color: '#FF6482' },
  { id: 'nbi-kilimani', name: 'Kilimani', city: 'Nairobi', country: 'Kenya', lat: -1.2920, lng: 36.7850, basePrice: 220, pricePerKg: 25, pricePerKm: 18, estimatedMinutes: 35, sameDay: true, color: '#5856D6' },
  { id: 'nbi-eastlands', name: 'Eastlands', city: 'Nairobi', country: 'Kenya', lat: -1.2730, lng: 36.8600, basePrice: 180, pricePerKg: 22, pricePerKm: 16, estimatedMinutes: 40, sameDay: true, color: '#00C7BE' },
  { id: 'nbi-industrial', name: 'Industrial Area', city: 'Nairobi', country: 'Kenya', lat: -1.2580, lng: 36.8620, basePrice: 200, pricePerKg: 22, pricePerKm: 18, estimatedMinutes: 35, sameDay: true, color: '#FF2D55' },
  { id: 'nbi-kiambu', name: 'Kiambu Road', city: 'Nairobi', country: 'Kenya', lat: -1.2200, lng: 36.8300, basePrice: 280, pricePerKg: 30, pricePerKm: 22, estimatedMinutes: 45, sameDay: true, color: '#AF52DE' },
  { id: 'nbi-thika', name: 'Thika Road', city: 'Nairobi', country: 'Kenya', lat: -1.2000, lng: 36.8700, basePrice: 300, pricePerKg: 32, pricePerKm: 24, estimatedMinutes: 50, sameDay: true, color: '#FF9F0A' },
  { id: 'nbi-langata', name: 'Lang\'ata', city: 'Nairobi', country: 'Kenya', lat: -1.3100, lng: 36.7900, basePrice: 250, pricePerKg: 28, pricePerKm: 20, estimatedMinutes: 40, sameDay: true, color: '#64D2FF' },
  { id: 'nbi-kasarani', name: 'Kasarani', city: 'Nairobi', country: 'Kenya', lat: -1.2200, lng: 36.9000, basePrice: 250, pricePerKg: 28, pricePerKm: 20, estimatedMinutes: 45, sameDay: true, color: '#30D158' },
  { id: 'nbi-ruaka', name: 'Ruaka', city: 'Nairobi', country: 'Kenya', lat: -1.1900, lng: 36.7700, basePrice: 300, pricePerKg: 32, pricePerKm: 24, estimatedMinutes: 55, sameDay: true, color: '#BF5AF2' },
  { id: 'nbi-kahawa', name: 'Kahawa', city: 'Nairobi', country: 'Kenya', lat: -1.1800, lng: 36.9100, basePrice: 280, pricePerKg: 30, pricePerKm: 22, estimatedMinutes: 50, sameDay: true, color: '#FF375F' },
  { id: 'nbi-embakasi', name: 'Embakasi', city: 'Nairobi', country: 'Kenya', lat: -1.2600, lng: 36.8800, basePrice: 200, pricePerKg: 22, pricePerKm: 18, estimatedMinutes: 40, sameDay: true, color: '#0A84FF' },
  { id: 'nbi-utawala', name: 'Utawala', city: 'Nairobi', country: 'Kenya', lat: -1.2400, lng: 36.9200, basePrice: 280, pricePerKg: 30, pricePerKm: 22, estimatedMinutes: 50, sameDay: true, color: '#FF453A' },
  { id: 'nbi-kitengela', name: 'Kitengela', city: 'Nairobi', country: 'Kenya', lat: -1.4500, lng: 36.9600, basePrice: 400, pricePerKg: 40, pricePerKm: 30, estimatedMinutes: 70, sameDay: false, color: '#AC8E68' },
  { id: 'nbi-athi-river', name: 'Athi River', city: 'Nairobi', country: 'Kenya', lat: -1.4500, lng: 36.9900, basePrice: 400, pricePerKg: 40, pricePerKm: 30, estimatedMinutes: 75, sameDay: false, color: '#8E8E93' },
];

// ─── Kenya Cities ──────────────────────────────────────────────────────────

const KENYA_CITIES: CityPricing[] = [
  { city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, zones: NAIROBI_ZONES, standardDelivery: 200, expressDelivery: 400, sameDayAvailable: true, currency: 'KES' },
  { city: 'Mombasa', country: 'Kenya', lat: -4.0435, lng: 39.6682, zones: [
    { id: 'msa-cbd', name: 'CBD', city: 'Mombasa', country: 'Kenya', lat: -4.0435, lng: 39.6682, basePrice: 200, pricePerKg: 25, pricePerKm: 20, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
    { id: 'msa-nyali', name: 'Nyali', city: 'Mombasa', country: 'Kenya', lat: -4.0200, lng: 39.6800, basePrice: 280, pricePerKg: 30, pricePerKm: 22, estimatedMinutes: 45, sameDay: true, color: '#30D158' },
    { id: 'msa-shanzu', name: 'Shanzu', city: 'Mombasa', country: 'Kenya', lat: -3.9700, lng: 39.7000, basePrice: 350, pricePerKg: 35, pricePerKm: 28, estimatedMinutes: 55, sameDay: true, color: '#FF9500' },
    { id: 'msa-likoni', name: 'Likoni', city: 'Mombasa', country: 'Kenya', lat: -4.0800, lng: 39.6600, basePrice: 300, pricePerKg: 32, pricePerKm: 25, estimatedMinutes: 50, sameDay: true, color: '#FF6482' },
    { id: 'msa-changamwe', name: 'Changamwe', city: 'Mombasa', country: 'Kenya', lat: -4.0300, lng: 39.6300, basePrice: 250, pricePerKg: 28, pricePerKm: 20, estimatedMinutes: 40, sameDay: true, color: '#5856D6' },
  ], standardDelivery: 250, expressDelivery: 500, sameDayAvailable: true, currency: 'KES' },
  { city: 'Kisumu', country: 'Kenya', lat: -0.1022, lng: 34.7617, zones: [
    { id: 'ksm-cbd', name: 'CBD', city: 'Kisumu', country: 'Kenya', lat: -0.1022, lng: 34.7617, basePrice: 200, pricePerKg: 25, pricePerKm: 20, estimatedMinutes: 30, sameDay: true, color: '#007AFF' },
    { id: 'ksm-milimani', name: 'Milimani', city: 'Kisumu', country: 'Kenya', lat: -0.0900, lng: 34.7500, basePrice: 250, pricePerKg: 28, pricePerKm: 22, estimatedMinutes: 40, sameDay: true, color: '#30D158' },
    { id: 'ksm-kondele', name: 'Kondele', city: 'Kisumu', country: 'Kenya', lat: -0.1100, lng: 34.7700, basePrice: 220, pricePerKg: 25, pricePerKm: 20, estimatedMinutes: 35, sameDay: true, color: '#FF9500' },
  ], standardDelivery: 250, expressDelivery: 500, sameDayAvailable: true, currency: 'KES' },
  { city: 'Nakuru', country: 'Kenya', lat: -0.3031, lng: 36.0800, zones: [
    { id: 'nkr-cbd', name: 'CBD', city: 'Nakuru', country: 'Kenya', lat: -0.3031, lng: 36.0800, basePrice: 200, pricePerKg: 25, pricePerKm: 20, estimatedMinutes: 30, sameDay: true, color: '#007AFF' },
    { id: 'nkr-naivasha', name: 'Naivasha Road', city: 'Nakuru', country: 'Kenya', lat: -0.2900, lng: 36.0700, basePrice: 250, pricePerKg: 28, pricePerKm: 22, estimatedMinutes: 40, sameDay: true, color: '#30D158' },
  ], standardDelivery: 250, expressDelivery: 500, sameDayAvailable: true, currency: 'KES' },
  { city: 'Eldoret', country: 'Kenya', lat: 0.5143, lng: 35.2698, zones: [
    { id: 'eld-cbd', name: 'CBD', city: 'Eldoret', country: 'Kenya', lat: 0.5143, lng: 35.2698, basePrice: 250, pricePerKg: 28, pricePerKm: 22, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 300, expressDelivery: 600, sameDayAvailable: true, currency: 'KES' },
  { city: 'Thika', country: 'Kenya', lat: -1.0400, lng: 37.0700, zones: [
    { id: 'thk-cbd', name: 'CBD', city: 'Thika', country: 'Kenya', lat: -1.0400, lng: 37.0700, basePrice: 200, pricePerKg: 22, pricePerKm: 18, estimatedMinutes: 30, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 250, expressDelivery: 450, sameDayAvailable: true, currency: 'KES' },
  { city: 'Machakos', country: 'Kenya', lat: -1.5177, lng: 37.2634, zones: [
    { id: 'mch-cbd', name: 'CBD', city: 'Machakos', country: 'Kenya', lat: -1.5177, lng: 37.2634, basePrice: 250, pricePerKg: 28, pricePerKm: 22, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 300, expressDelivery: 550, sameDayAvailable: true, currency: 'KES' },
  { city: 'Nyeri', country: 'Kenya', lat: -0.4246, lng: 36.9476, zones: [
    { id: 'nyr-cbd', name: 'CBD', city: 'Nyeri', country: 'Kenya', lat: -0.4246, lng: 36.9476, basePrice: 280, pricePerKg: 30, pricePerKm: 24, estimatedMinutes: 40, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 350, expressDelivery: 650, sameDayAvailable: false, currency: 'KES' },
  { city: 'Meru', country: 'Kenya', lat: 0.0467, lng: 37.6499, zones: [
    { id: 'mer-cbd', name: 'CBD', city: 'Meru', country: 'Kenya', lat: 0.0467, lng: 37.6499, basePrice: 300, pricePerKg: 32, pricePerKm: 25, estimatedMinutes: 45, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 350, expressDelivery: 700, sameDayAvailable: false, currency: 'KES' },
  { city: 'Malindi', country: 'Kenya', lat: -3.2175, lng: 40.1270, zones: [
    { id: 'mln-cbd', name: 'CBD', city: 'Malindi', country: 'Kenya', lat: -3.2175, lng: 40.1270, basePrice: 300, pricePerKg: 32, pricePerKm: 25, estimatedMinutes: 40, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 350, expressDelivery: 700, sameDayAvailable: false, currency: 'KES' },
  { city: 'Kilifi', country: 'Kenya', lat: -3.6307, lng: 39.8769, zones: [
    { id: 'klf-cbd', name: 'CBD', city: 'Kilifi', country: 'Kenya', lat: -3.6307, lng: 39.8769, basePrice: 350, pricePerKg: 35, pricePerKm: 28, estimatedMinutes: 45, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 400, expressDelivery: 750, sameDayAvailable: false, currency: 'KES' },
  { city: 'Kakamega', country: 'Kenya', lat: 0.2827, lng: 34.7519, zones: [
    { id: 'klg-cbd', name: 'CBD', city: 'Kakamega', country: 'Kenya', lat: 0.2827, lng: 34.7519, basePrice: 300, pricePerKg: 32, pricePerKm: 25, estimatedMinutes: 45, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 350, expressDelivery: 700, sameDayAvailable: false, currency: 'KES' },
  { city: 'Kitale', country: 'Kenya', lat: 1.0187, lng: 35.0020, zones: [
    { id: 'ktl-cbd', name: 'CBD', city: 'Kitale', country: 'Kenya', lat: 1.0187, lng: 35.0020, basePrice: 350, pricePerKg: 35, pricePerKm: 28, estimatedMinutes: 50, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 400, expressDelivery: 800, sameDayAvailable: false, currency: 'KES' },
  { city: 'Garissa', country: 'Kenya', lat: -0.4530, lng: 39.6401, zones: [
    { id: 'grs-cbd', name: 'CBD', city: 'Garissa', country: 'Kenya', lat: -0.4530, lng: 39.6401, basePrice: 400, pricePerKg: 40, pricePerKm: 32, estimatedMinutes: 60, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 500, expressDelivery: 900, sameDayAvailable: false, currency: 'KES' },
  { city: 'Lamu', country: 'Kenya', lat: -2.2696, lng: 40.9020, zones: [
    { id: 'lam-cbd', name: 'CBD', city: 'Lamu', country: 'Kenya', lat: -2.2696, lng: 40.9020, basePrice: 500, pricePerKg: 50, pricePerKm: 40, estimatedMinutes: 90, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 600, expressDelivery: 1000, sameDayAvailable: false, currency: 'KES' },
  { city: 'Naivasha', country: 'Kenya', lat: -0.7133, lng: 36.4316, zones: [
    { id: 'nvs-cbd', name: 'CBD', city: 'Naivasha', country: 'Kenya', lat: -0.7133, lng: 36.4316, basePrice: 280, pricePerKg: 30, pricePerKm: 22, estimatedMinutes: 40, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 300, expressDelivery: 600, sameDayAvailable: true, currency: 'KES' },
  { city: 'Nanyuki', country: 'Kenya', lat: 0.0179, lng: 37.0727, zones: [
    { id: 'nnk-cbd', name: 'CBD', city: 'Nanyuki', country: 'Kenya', lat: 0.0179, lng: 37.0727, basePrice: 400, pricePerKg: 40, pricePerKm: 32, estimatedMinutes: 60, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 450, expressDelivery: 850, sameDayAvailable: false, currency: 'KES' },
];

// ─── Tanzania Cities ───────────────────────────────────────────────────────

const TANZANIA_CITIES: CityPricing[] = [
  { city: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lng: 39.2083, zones: [
    { id: 'dar-cbd', name: 'CBD', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lng: 39.2083, basePrice: 3000, pricePerKg: 400, pricePerKm: 300, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
    { id: 'dar-kinondoni', name: 'Kinondoni', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.7700, lng: 39.2500, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 45, sameDay: true, color: '#30D158' },
    { id: 'dar-Ilala', name: 'Ilala', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.8100, lng: 39.2700, basePrice: 3200, pricePerKg: 420, pricePerKm: 320, estimatedMinutes: 40, sameDay: true, color: '#FF9500' },
    { id: 'dar-temeke', name: 'Temeke', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.8500, lng: 39.2800, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 50, sameDay: true, color: '#FF6482' },
    { id: 'dar-kigamboni', name: 'Kigamboni', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.8800, lng: 39.3000, basePrice: 4000, pricePerKg: 500, pricePerKm: 400, estimatedMinutes: 60, sameDay: true, color: '#5856D6' },
  ], standardDelivery: 3500, expressDelivery: 7000, sameDayAvailable: true, currency: 'TZS' },
  { city: 'Arusha', country: 'Tanzania', lat: -3.3869, lng: 36.6830, zones: [
    { id: 'ar-cbd', name: 'CBD', city: 'Arusha', country: 'Tanzania', lat: -3.3869, lng: 36.6830, basePrice: 3000, pricePerKg: 400, pricePerKm: 300, estimatedMinutes: 30, sameDay: true, color: '#007AFF' },
    { id: 'ar-ngorongoro', name: 'Ngorongoro Area', city: 'Arusha', country: 'Tanzania', lat: -3.3500, lng: 36.6200, basePrice: 4500, pricePerKg: 600, pricePerKm: 500, estimatedMinutes: 60, sameDay: false, color: '#FF9500' },
  ], standardDelivery: 3500, expressDelivery: 7000, sameDayAvailable: true, currency: 'TZS' },
  { city: 'Mwanza', country: 'Tanzania', lat: -2.5164, lng: 32.9175, zones: [
    { id: 'mw-cbd', name: 'CBD', city: 'Mwanza', country: 'Tanzania', lat: -2.5164, lng: 32.9175, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 4000, expressDelivery: 8000, sameDayAvailable: true, currency: 'TZS' },
  { city: 'Dodoma', country: 'Tanzania', lat: -6.1630, lng: 35.7516, zones: [
    { id: 'ddm-cbd', name: 'CBD', city: 'Dodoma', country: 'Tanzania', lat: -6.1630, lng: 35.7516, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 40, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 4000, expressDelivery: 8000, sameDayAvailable: false, currency: 'TZS' },
  { city: 'Zanzibar City', country: 'Tanzania', lat: -6.1659, lng: 39.2026, zones: [
    { id: 'znz-cbd', name: 'Stone Town', city: 'Zanzibar City', country: 'Tanzania', lat: -6.1659, lng: 39.2026, basePrice: 4000, pricePerKg: 500, pricePerKm: 400, estimatedMinutes: 45, sameDay: true, color: '#007AFF' },
    { id: 'znz-ngc', name: 'Nungwi', city: 'Zanzibar City', country: 'Tanzania', lat: -5.9500, lng: 39.3000, basePrice: 5000, pricePerKg: 600, pricePerKm: 500, estimatedMinutes: 60, sameDay: true, color: '#30D158' },
  ], standardDelivery: 4500, expressDelivery: 9000, sameDayAvailable: true, currency: 'TZS' },
  { city: 'Tanga', country: 'Tanzania', lat: -5.0689, lng: 39.0986, zones: [
    { id: 'tg-cbd', name: 'CBD', city: 'Tanga', country: 'Tanzania', lat: -5.0689, lng: 39.0986, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 40, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 4000, expressDelivery: 8000, sameDayAvailable: false, currency: 'TZS' },
  { city: 'Mbeya', country: 'Tanzania', lat: -8.8998, lng: 33.3925, zones: [
    { id: 'mb-cbd', name: 'CBD', city: 'Mbeya', country: 'Tanzania', lat: -8.8998, lng: 33.3925, basePrice: 4000, pricePerKg: 500, pricePerKm: 400, estimatedMinutes: 50, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 5000, expressDelivery: 10000, sameDayAvailable: false, currency: 'TZS' },
  { city: 'Morogoro', country: 'Tanzania', lat: -6.8213, lng: 37.6591, zones: [
    { id: 'mor-cbd', name: 'CBD', city: 'Morogoro', country: 'Tanzania', lat: -6.8213, lng: 37.6591, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 45, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 4000, expressDelivery: 8000, sameDayAvailable: false, currency: 'TZS' },
  { city: 'Iringa', country: 'Tanzania', lat: -7.7669, lng: 35.6916, zones: [
    { id: 'ir-cbd', name: 'CBD', city: 'Iringa', country: 'Tanzania', lat: -7.7669, lng: 35.6916, basePrice: 4000, pricePerKg: 500, pricePerKm: 400, estimatedMinutes: 55, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 5000, expressDelivery: 10000, sameDayAvailable: false, currency: 'TZS' },
  { city: 'Kilimanjaro', country: 'Tanzania', lat: -3.3029, lng: 37.3360, zones: [
    { id: 'kmj-cbd', name: 'Moshi', city: 'Kilimanjaro', country: 'Tanzania', lat: -3.3029, lng: 37.3360, basePrice: 3500, pricePerKg: 450, pricePerKm: 350, estimatedMinutes: 40, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 4000, expressDelivery: 8000, sameDayAvailable: false, currency: 'TZS' },
  { city: 'Tabora', country: 'Tanzania', lat: -5.0167, lng: 32.8000, zones: [
    { id: 'tb-cbd', name: 'CBD', city: 'Tabora', country: 'Tanzania', lat: -5.0167, lng: 32.8000, basePrice: 4500, pricePerKg: 550, pricePerKm: 450, estimatedMinutes: 60, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 5000, expressDelivery: 10000, sameDayAvailable: false, currency: 'TZS' },
];

// ─── Uganda Cities ─────────────────────────────────────────────────────────

const UGANDA_CITIES: CityPricing[] = [
  { city: 'Kampala', country: 'Uganda', lat: 0.3476, lng: 32.5825, zones: [
    { id: 'kla-cbd', name: 'CBD', city: 'Kampala', country: 'Uganda', lat: 0.3476, lng: 32.5825, basePrice: 5000, pricePerKg: 600, pricePerKm: 500, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
    { id: 'kla-nakasero', name: 'Nakasero', city: 'Kampala', country: 'Uganda', lat: 0.3350, lng: 32.5700, basePrice: 5500, pricePerKg: 650, pricePerKm: 550, estimatedMinutes: 30, sameDay: true, color: '#30D158' },
    { id: 'kla-kololo', name: 'Kololo', city: 'Kampala', country: 'Uganda', lat: 0.3400, lng: 32.5900, basePrice: 5500, pricePerKg: 650, pricePerKm: 550, estimatedMinutes: 35, sameDay: true, color: '#FF9500' },
    { id: 'kla-ntinda', name: 'Ntinda', city: 'Kampala', country: 'Uganda', lat: 0.3500, lng: 32.6000, basePrice: 6000, pricePerKg: 700, pricePerKm: 600, estimatedMinutes: 40, sameDay: true, color: '#FF6482' },
    { id: 'kla-mukono', name: 'Mukono', city: 'Kampala', country: 'Uganda', lat: 0.3533, lng: 32.7500, basePrice: 7000, pricePerKg: 800, pricePerKm: 700, estimatedMinutes: 55, sameDay: true, color: '#5856D6' },
    { id: 'kla-entebbe', name: 'Entebbe', city: 'Kampala', country: 'Uganda', lat: 0.0564, lng: 32.4637, basePrice: 8000, pricePerKg: 900, pricePerKm: 800, estimatedMinutes: 70, sameDay: true, color: '#00C7BE' },
  ], standardDelivery: 5000, expressDelivery: 10000, sameDayAvailable: true, currency: 'UGX' },
  { city: 'Jinja', country: 'Uganda', lat: 0.4244, lng: 33.2041, zones: [
    { id: 'jin-cbd', name: 'CBD', city: 'Jinja', country: 'Uganda', lat: 0.4244, lng: 33.2041, basePrice: 5000, pricePerKg: 600, pricePerKm: 500, estimatedMinutes: 35, sameDay: true, color: '#007AFF' },
  ], standardDelivery: 6000, expressDelivery: 12000, sameDayAvailable: true, currency: 'UGX' },
  { city: 'Mbale', country: 'Uganda', lat: 1.0824, lng: 34.1755, zones: [
    { id: 'mba-cbd', name: 'CBD', city: 'Mbale', country: 'Uganda', lat: 1.0824, lng: 34.1755, basePrice: 6000, pricePerKg: 700, pricePerKm: 600, estimatedMinutes: 45, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 7000, expressDelivery: 14000, sameDayAvailable: false, currency: 'UGX' },
  { city: 'Gulu', country: 'Uganda', lat: 2.7747, lng: 32.2990, zones: [
    { id: 'gul-cbd', name: 'CBD', city: 'Gulu', country: 'Uganda', lat: 2.7747, lng: 32.2990, basePrice: 7000, pricePerKg: 800, pricePerKm: 700, estimatedMinutes: 55, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 8000, expressDelivery: 16000, sameDayAvailable: false, currency: 'UGX' },
  { city: 'Mbarara', country: 'Uganda', lat: -0.6072, lng: 30.6545, zones: [
    { id: 'mbr-cbd', name: 'CBD', city: 'Mbarara', country: 'Uganda', lat: -0.6072, lng: 30.6545, basePrice: 6000, pricePerKg: 700, pricePerKm: 600, estimatedMinutes: 50, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 7000, expressDelivery: 14000, sameDayAvailable: false, currency: 'UGX' },
  { city: 'Lira', country: 'Uganda', lat: 2.2443, lng: 32.8998, zones: [
    { id: 'lir-cbd', name: 'CBD', city: 'Lira', country: 'Uganda', lat: 2.2443, lng: 32.8998, basePrice: 6000, pricePerKg: 700, pricePerKm: 600, estimatedMinutes: 50, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 7000, expressDelivery: 14000, sameDayAvailable: false, currency: 'UGX' },
  { city: 'Fort Portal', country: 'Uganda', lat: 0.6710, lng: 30.2750, zones: [
    { id: 'fp-cbd', name: 'CBD', city: 'Fort Portal', country: 'Uganda', lat: 0.6710, lng: 30.2750, basePrice: 6500, pricePerKg: 750, pricePerKm: 650, estimatedMinutes: 55, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 7500, expressDelivery: 15000, sameDayAvailable: false, currency: 'UGX' },
  { city: 'Soroti', country: 'Uganda', lat: 1.7125, lng: 33.6120, zones: [
    { id: 'sor-cbd', name: 'CBD', city: 'Soroti', country: 'Uganda', lat: 1.7125, lng: 33.6120, basePrice: 6500, pricePerKg: 750, pricePerKm: 650, estimatedMinutes: 55, sameDay: false, color: '#007AFF' },
  ], standardDelivery: 7500, expressDelivery: 15000, sameDayAvailable: false, currency: 'UGX' },
];

// ─── Rwanda Cities ─────────────────────────────────────────────────────────

const RWANDA_CITIES: CityPricing[] = [
  { city: 'Kigali', country: 'Rwanda', lat: -1.9403, lng: 29.8739, zones: [
    { id: 'kgl-cbd', name: 'CBD', city: 'Kigali', country: 'Rwanda', lat: -1.9403, lng: 29.8739, basePrice: 1000, pricePerKg: 150, pricePerKm: 100, estimatedMinutes: 30, sameDay: true, color: '#007AFF' },
    { id: 'kgl-gasabo', name: 'Gasabo', city: 'Kigali', country: 'Rwanda', lat: -1.9200, lng: 29.9000, basePrice: 1200, pricePerKg: 180, pricePerKm: 120, estimatedMinutes: 40, sameDay: true, color: '#30D158' },
    { id: 'kgl-kicukiro', name: 'Kicukiro', city: 'Kigali', country: 'Rwanda', lat: -1.9600, lng: 29.9200, basePrice: 1200, pricePerKg: 180, pricePerKm: 120, estimatedMinutes: 35, sameDay: true, color: '#FF9500' },
  ], standardDelivery: 1000, expressDelivery: 2500, sameDayAvailable: true, currency: 'RWF' },
];

// ─── All Cities ────────────────────────────────────────────────────────────

export const ALL_CITIES: CityPricing[] = [
  ...KENYA_CITIES,
  ...TANZANIA_CITIES,
  ...UGANDA_CITIES,
  ...RWANDA_CITIES,
];

export const COUNTRIES = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda'] as const;

export const COUNTRY_CURRENCY: Record<string, string> = {
  'Kenya': 'KES',
  'Tanzania': 'TZS',
  'Uganda': 'UGX',
  'Rwanda': 'RWF',
};

// ─── Utility Functions ─────────────────────────────────────────────────────

export function getCitiesByCountry(country: string): CityPricing[] {
  return ALL_CITIES.filter(c => c.country === country);
}

export function getCityPricing(city: string, country: string): CityPricing | undefined {
  return ALL_CITIES.find(c => c.city === city && c.country === country);
}

export function getZonePricing(zoneId: string): DeliveryZone | undefined {
  for (const city of ALL_CITIES) {
    const zone = city.zones.find(z => z.id === zoneId);
    if (zone) return zone;
  }
  return undefined;
}

export function calculateDeliveryPrice(
  zoneId: string,
  weightKg: number,
  distanceKm: number
): number {
  const zone = getZonePricing(zoneId);
  if (!zone) return 0;
  return zone.basePrice + (zone.pricePerKg * weightKg) + (zone.pricePerKm * distanceKm);
}

export function getNairobiZones(): DeliveryZone[] {
  return NAIROBI_ZONES;
}

// ─── Cross-Border Pricing ──────────────────────────────────────────────────

export interface CrossBorderRoute {
  from: string;
  to: string;
  basePrice: number;
  pricePerKg: number;
  estimatedDays: number;
  carrier: string;
}

export const CROSS_BORDER_ROUTES: CrossBorderRoute[] = [
  { from: 'Kenya', to: 'Tanzania', basePrice: 2500, pricePerKg: 500, estimatedDays: 3, carrier: 'PortMetrics Express' },
  { from: 'Kenya', to: 'Uganda', basePrice: 3000, pricePerKg: 600, estimatedDays: 3, carrier: 'PortMetrics Express' },
  { from: 'Kenya', to: 'Rwanda', basePrice: 3500, pricePerKg: 700, estimatedDays: 4, carrier: 'PortMetrics Express' },
  { from: 'Tanzania', to: 'Kenya', basePrice: 2500, pricePerKg: 500, estimatedDays: 3, carrier: 'PortMetrics Express' },
  { from: 'Tanzania', to: 'Uganda', basePrice: 3500, pricePerKg: 700, estimatedDays: 4, carrier: 'PortMetrics Express' },
  { from: 'Uganda', to: 'Kenya', basePrice: 3000, pricePerKg: 600, estimatedDays: 3, carrier: 'PortMetrics Express' },
  { from: 'Uganda', to: 'Tanzania', basePrice: 3500, pricePerKg: 700, estimatedDays: 4, carrier: 'PortMetrics Express' },
  { from: 'Rwanda', to: 'Kenya', basePrice: 3500, pricePerKg: 700, estimatedDays: 4, carrier: 'PortMetrics Express' },
];

export function getCrossBorderRoute(from: string, to: string): CrossBorderRoute | undefined {
  return CROSS_BORDER_ROUTES.find(r => r.from === from && r.to === to);
}

// ─── Tracked Order Types & Seed Data ───────────────────────────────────────

export type TrackingStatus =
  | 'placed' | 'confirmed' | 'processing' | 'picked_up'
  | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

export interface TrackingEvent {
  status: TrackingStatus;
  timestamp: string;
  location: string;
  lat: number;
  lng: number;
  note: string;
}

export interface TrackedOrder {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  totalAmount: number;
  currency: Currency;
  status: TrackingStatus;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  destinationZone: string;
  destinationLat: number;
  destinationLng: number;
  currentLat: number;
  currentLng: number;
  trackingNumber: string;
  carrier: string;
  createdAt: string;
  estimatedDelivery: string;
  deliveredAt?: string;
  events: TrackingEvent[];
  customerName: string;
  customerPhone: string;
}

export const SEED_TRACKED_ORDERS: TrackedOrder[] = [
  // ─── Order 001: Tanzania → Kenya (In Transit) ───────────────────────────
  {
    id: 'ord-001', productName: 'Men Cotton Shirt', productImage: '👔', quantity: 5, totalAmount: 135000, currency: 'TZS', status: 'in_transit',
    originCity: 'Dar es Salaam', originCountry: 'Tanzania', destinationCity: 'Nairobi', destinationCountry: 'Kenya', destinationZone: 'Westlands',
    destinationLat: -1.2674, destinationLng: 36.8031, currentLat: -3.5000, currentLng: 37.5000,
    trackingNumber: 'PM-TZ-2026-001', carrier: 'PortMetrics Express', createdAt: '2026-07-18T08:30:00Z', estimatedDelivery: '2026-07-22T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-18T08:30:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Order placed successfully' },
      { status: 'confirmed', timestamp: '2026-07-18T09:15:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Order confirmed by seller' },
      { status: 'processing', timestamp: '2026-07-18T14:00:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Items being prepared for shipment' },
      { status: 'picked_up', timestamp: '2026-07-19T07:30:00Z', location: 'Dar es Salaam Warehouse', lat: -6.7700, lng: 39.2500, note: 'Picked up by PortMetrics Express' },
      { status: 'in_transit', timestamp: '2026-07-19T12:00:00Z', location: 'Arusha Transit Hub', lat: -3.3869, lng: 36.6830, note: 'In transit via Arusha' },
    ],
    customerName: 'Frank Musau', customerPhone: '+254712345678',
  },
  // ─── Order 002: Kenya → Uganda (Delivered) ──────────────────────────────
  {
    id: 'ord-002', productName: 'MacBook Air M2', productImage: '💻', quantity: 1, totalAmount: 850000, currency: 'TZS', status: 'delivered',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Kampala', destinationCountry: 'Uganda', destinationZone: 'Nakasero',
    destinationLat: 0.3350, destinationLng: 32.5700, currentLat: 0.3350, currentLng: 32.5700,
    trackingNumber: 'PM-KE-2026-002', carrier: 'PortMetrics Express', createdAt: '2026-07-15T10:00:00Z', estimatedDelivery: '2026-07-20T18:00:00Z', deliveredAt: '2026-07-19T14:30:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-15T10:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-15T10:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order confirmed' },
      { status: 'processing', timestamp: '2026-07-15T14:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Packing item' },
      { status: 'picked_up', timestamp: '2026-07-16T08:00:00Z', location: 'Nairobi Hub', lat: -1.2600, lng: 36.8800, note: 'Picked up for cross-border delivery' },
      { status: 'in_transit', timestamp: '2026-07-16T15:00:00Z', location: 'Malaba Border', lat: 0.6300, lng: 34.2700, note: 'Cleared at Malaba border' },
      { status: 'in_transit', timestamp: '2026-07-17T10:00:00Z', location: 'Jinja', lat: 0.4244, lng: 33.2041, note: 'Arrived in Jinja' },
      { status: 'out_for_delivery', timestamp: '2026-07-19T08:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Out for delivery' },
      { status: 'delivered', timestamp: '2026-07-19T14:30:00Z', location: 'Kampala', lat: 0.3350, lng: 32.5700, note: 'Delivered successfully - Signed by customer' },
    ],
    customerName: 'Aisha Nakamya', customerPhone: '+256789123456',
  },
  // ─── Order 003: Kenya Domestic (Out for Delivery) ───────────────────────
  {
    id: 'ord-003', productName: 'Wholesale Bale 45kg', productImage: '📦', quantity: 2, totalAmount: 1400000, currency: 'TZS', status: 'out_for_delivery',
    originCity: 'Mombasa', originCountry: 'Kenya', destinationCity: 'Nairobi', destinationCountry: 'Kenya', destinationZone: 'CBD',
    destinationLat: -1.2864, destinationLng: 36.8172, currentLat: -1.2000, currentLng: 37.0000,
    trackingNumber: 'PM-KE-2026-003', carrier: 'PortMetrics Express', createdAt: '2026-07-19T06:00:00Z', estimatedDelivery: '2026-07-21T12:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-19T06:00:00Z', location: 'Mombasa', lat: -4.0435, lng: 39.6682, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-19T06:45:00Z', location: 'Mombasa', lat: -4.0435, lng: 39.6682, note: 'Order confirmed' },
      { status: 'processing', timestamp: '2026-07-19T12:00:00Z', location: 'Mombasa Warehouse', lat: -4.0300, lng: 39.6300, note: 'Loading bales' },
      { status: 'picked_up', timestamp: '2026-07-20T06:00:00Z', location: 'Mombasa Port', lat: -4.0400, lng: 39.6700, note: 'Picked up - Express truck' },
      { status: 'in_transit', timestamp: '2026-07-20T10:00:00Z', location: 'Mariakani', lat: -3.8500, lng: 39.5700, note: 'In transit on Mombasa-Nairobi highway' },
      { status: 'in_transit', timestamp: '2026-07-20T16:00:00Z', location: 'Voi', lat: -3.3900, lng: 38.5500, note: 'Passed Voi checkpoint' },
      { status: 'out_for_delivery', timestamp: '2026-07-21T06:00:00Z', location: 'Athi River', lat: -1.4500, lng: 36.9900, note: 'Arrived in Nairobi area - Out for delivery' },
    ],
    customerName: 'Jabali Enterprises', customerPhone: '+254722345678',
  },
  // ─── Order 004: Kenya → Tanzania (Confirmed) ────────────────────────────
  {
    id: 'ord-004', productName: 'iPhone 14 Pro', productImage: '📱', quantity: 2, totalAmount: 1300000, currency: 'TZS', status: 'confirmed',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Arusha', destinationCountry: 'Tanzania', destinationZone: 'CBD',
    destinationLat: -3.3869, destinationLng: 36.6830, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-004', carrier: 'PortMetrics Express', createdAt: '2026-07-21T07:00:00Z', estimatedDelivery: '2026-07-25T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T07:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-21T07:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order confirmed - Awaiting pickup' },
    ],
    customerName: 'Neema Electronics', customerPhone: '+255712345678',
  },
  // ─── Order 005: Kenya → Tanzania (Processing) ───────────────────────────
  {
    id: 'ord-005', productName: 'Ladies Handbags Collection', productImage: '👜', quantity: 10, totalAmount: 220000, currency: 'TZS', status: 'processing',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Dar es Salaam', destinationCountry: 'Tanzania', destinationZone: 'Kinondoni',
    destinationLat: -6.7700, destinationLng: 39.2500, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-005', carrier: 'PortMetrics Express', createdAt: '2026-07-21T05:00:00Z', estimatedDelivery: '2026-07-26T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T05:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-21T05:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order confirmed' },
      { status: 'processing', timestamp: '2026-07-21T08:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Packing 10 handbags' },
    ],
    customerName: 'Mama Zawadi Boutique', customerPhone: '+255754321098',
  },
  // ─── Order 006: Kenya → Rwanda (Placed) ─────────────────────────────────
  {
    id: 'ord-006', productName: 'Sony WH-1000XM5', productImage: '🎧', quantity: 3, totalAmount: 540000, currency: 'TZS', status: 'placed',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Kigali', destinationCountry: 'Rwanda', destinationZone: 'Gasabo',
    destinationLat: -1.9200, destinationLng: 29.9000, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-006', carrier: 'PortMetrics Express', createdAt: '2026-07-21T09:00:00Z', estimatedDelivery: '2026-07-27T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T09:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed - Awaiting confirmation' },
    ],
    customerName: 'TechHub Rwanda', customerPhone: '+250789123456',
  },
  // ─── Order 007: Tanzania Domestic (Delivered) ────────────────────────────
  {
    id: 'ord-007', productName: 'Cotton Bedsheet Set', productImage: '🛏️', quantity: 8, totalAmount: 360000, currency: 'TZS', status: 'delivered',
    originCity: 'Dar es Salaam', originCountry: 'Tanzania', destinationCity: 'Mwanza', destinationCountry: 'Tanzania', destinationZone: 'Milimani',
    destinationLat: -2.5164, destinationLng: 32.9175, currentLat: -2.5164, currentLng: 32.9175,
    trackingNumber: 'PM-TZ-2026-007', carrier: 'G4S Logistics', createdAt: '2026-07-10T14:00:00Z', estimatedDelivery: '2026-07-15T18:00:00Z', deliveredAt: '2026-07-14T11:20:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-10T14:00:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-10T14:30:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-11T09:00:00Z', location: 'Dar es Salaam Warehouse', lat: -6.7700, lng: 39.2500, note: 'Items packed' },
      { status: 'picked_up', timestamp: '2026-07-11T15:00:00Z', location: 'Dar es Salaam Hub', lat: -6.7924, lng: 39.2083, note: 'Picked up by G4S' },
      { status: 'in_transit', timestamp: '2026-07-12T08:00:00Z', location: 'Morogoro', lat: -6.8220, lng: 37.6600, note: 'In transit' },
      { status: 'in_transit', timestamp: '2026-07-13T10:00:00Z', location: 'Iringa', lat: -7.7700, lng: 35.6900, note: 'Passed Iringa' },
      { status: 'out_for_delivery', timestamp: '2026-07-14T07:00:00Z', location: 'Mwanza', lat: -2.5164, lng: 32.9175, note: 'Out for delivery' },
      { status: 'delivered', timestamp: '2026-07-14T11:20:00Z', location: 'Mwanza', lat: -2.5164, lng: 32.9175, note: 'Delivered - Customer signed' },
    ],
    customerName: 'Rehema Nkwabi', customerPhone: '+255754111222',
  },
  // ─── Order 008: Uganda Domestic (In Transit) ────────────────────────────
  {
    id: 'ord-008', productName: 'Dell XPS 15 Laptop', productImage: '💻', quantity: 1, totalAmount: 720000, currency: 'TZS', status: 'in_transit',
    originCity: 'Kampala', originCountry: 'Uganda', destinationCity: 'Jinja', destinationCountry: 'Uganda', destinationZone: 'Jinja Town',
    destinationLat: 0.4244, destinationLng: 33.2041, currentLat: 0.3500, currentLng: 32.8000,
    trackingNumber: 'PM-UG-2026-008', carrier: 'Aramex', createdAt: '2026-07-20T11:00:00Z', estimatedDelivery: '2026-07-22T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-20T11:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-20T11:30:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Order confirmed' },
      { status: 'processing', timestamp: '2026-07-20T14:00:00Z', location: 'Kampala Warehouse', lat: 0.3400, lng: 32.5800, note: 'Item packed with care instructions' },
      { status: 'picked_up', timestamp: '2026-07-21T08:00:00Z', location: 'Kampala Hub', lat: 0.3476, lng: 32.5825, note: 'Picked up by Aramex' },
      { status: 'in_transit', timestamp: '2026-07-21T12:00:00Z', location: 'Lugazi', lat: 0.2800, lng: 32.9200, note: 'In transit on Kampala-Jinja highway' },
    ],
    customerName: 'Peter Okello', customerPhone: '+256771234567',
  },
  // ─── Order 009: Rwanda → Kenya (Processing) ─────────────────────────────
  {
    id: 'ord-009', productName: 'Coffee Bean Collection', productImage: '☕', quantity: 20, totalAmount: 500000, currency: 'TZS', status: 'processing',
    originCity: 'Kigali', originCountry: 'Rwanda', destinationCity: 'Nairobi', destinationCountry: 'Kenya', destinationZone: 'Karen',
    destinationLat: -1.3200, destinationLng: 36.7100, currentLat: -1.9400, currentLng: 29.8800,
    trackingNumber: 'PM-RW-2026-009', carrier: 'DHL Express', createdAt: '2026-07-21T06:00:00Z', estimatedDelivery: '2026-07-26T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T06:00:00Z', location: 'Kigali', lat: -1.9400, lng: 29.8800, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-21T06:30:00Z', location: 'Kigali', lat: -1.9400, lng: 29.8800, note: 'Confirmed by supplier' },
      { status: 'processing', timestamp: '2026-07-21T10:00:00Z', location: 'Kigali Warehouse', lat: -1.9400, lng: 29.9000, note: 'Roasting and packaging coffee beans' },
    ],
    customerName: 'Sarah Wanjiku', customerPhone: '+254733444555',
  },
  // ─── Order 010: Kenya → Tanzania (In Transit) ───────────────────────────
  {
    id: 'ord-010', productName: 'Leather Jacket', productImage: '🧥', quantity: 3, totalAmount: 195000, currency: 'TZS', status: 'in_transit',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Dar es Salaam', destinationCountry: 'Tanzania', destinationZone: 'Oysterbay',
    destinationLat: -6.7700, destinationLng: 39.2700, currentLat: -4.5000, currentLng: 37.5000,
    trackingNumber: 'PM-KE-2026-010', carrier: 'PortMetrics Express', createdAt: '2026-07-17T13:00:00Z', estimatedDelivery: '2026-07-22T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-17T13:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-17T13:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-17T16:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Items packed in premium packaging' },
      { status: 'picked_up', timestamp: '2026-07-18T07:00:00Z', location: 'Nairobi Hub', lat: -1.2864, lng: 36.8172, note: 'Picked up' },
      { status: 'in_transit', timestamp: '2026-07-18T14:00:00Z', location: 'Namanga Border', lat: -2.5500, lng: 36.7800, note: 'Cleared at Namanga border' },
      { status: 'in_transit', timestamp: '2026-07-19T10:00:00Z', location: 'Arusha', lat: -3.3869, lng: 36.6830, note: 'In transit via Arusha' },
    ],
    customerName: 'David Mwangi', customerPhone: '+255766777888',
  },
  // ─── Order 011: Tanzania → Uganda (Delivered) ───────────────────────────
  {
    id: 'ord-011', productName: 'Wireless Earbuds', productImage: '🎧', quantity: 10, totalAmount: 450000, currency: 'TZS', status: 'delivered',
    originCity: 'Dar es Salaam', originCountry: 'Tanzania', destinationCity: 'Kampala', destinationCountry: 'Uganda', destinationZone: 'Kabalagala',
    destinationLat: 0.2900, destinationLng: 32.5800, currentLat: 0.2900, currentLng: 32.5800,
    trackingNumber: 'PM-TZ-2026-011', carrier: 'DHL Express', createdAt: '2026-07-08T09:00:00Z', estimatedDelivery: '2026-07-15T18:00:00Z', deliveredAt: '2026-07-14T09:45:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-08T09:00:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-08T09:30:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-09T10:00:00Z', location: 'Dar es Salaam Warehouse', lat: -6.7700, lng: 39.2500, note: 'Bulk packing 10 units' },
      { status: 'picked_up', timestamp: '2026-07-10T07:00:00Z', location: 'Dar es Salaam Hub', lat: -6.7924, lng: 39.2083, note: 'Picked up by DHL' },
      { status: 'in_transit', timestamp: '2026-07-11T12:00:00Z', location: 'Taveta Border', lat: -3.5900, lng: 37.6800, note: 'Cleared at Taveta' },
      { status: 'in_transit', timestamp: '2026-07-12T15:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Transit through Nairobi hub' },
      { status: 'out_for_delivery', timestamp: '2026-07-14T07:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Out for delivery' },
      { status: 'delivered', timestamp: '2026-07-14T09:45:00Z', location: 'Kampala', lat: 0.2900, lng: 32.5800, note: 'Delivered - Left with receptionist' },
    ],
    customerName: 'Grace Auma', customerPhone: '+256781222333',
  },
  // ─── Order 012: Kenya Domestic (Placed) ─────────────────────────────────
  {
    id: 'ord-012', productName: 'Skincare Gift Set', productImage: '✨', quantity: 4, totalAmount: 220000, currency: 'TZS', status: 'placed',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Mombasa', destinationCountry: 'Kenya', destinationZone: 'Nyali',
    destinationLat: -4.0200, destinationLng: 39.6800, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-012', carrier: 'Local Courier', createdAt: '2026-07-21T10:30:00Z', estimatedDelivery: '2026-07-24T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T10:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed - Awaiting seller confirmation' },
    ],
    customerName: 'Fatma Ali', customerPhone: '+254711999888',
  },
  // ─── Order 013: Uganda → Rwanda (In Transit) ────────────────────────────
  {
    id: 'ord-013', productName: 'School Uniform Bundle', productImage: '🎒', quantity: 50, totalAmount: 900000, currency: 'TZS', status: 'in_transit',
    originCity: 'Kampala', originCountry: 'Uganda', destinationCity: 'Kigali', destinationCountry: 'Rwanda', destinationZone: 'Kicukiro',
    destinationLat: -1.9600, destinationLng: 30.0600, currentLat: -0.5000, currentLng: 30.5000,
    trackingNumber: 'PM-UG-2026-013', carrier: 'G4S Logistics', createdAt: '2026-07-16T08:00:00Z', estimatedDelivery: '2026-07-22T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-16T08:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Bulk order placed' },
      { status: 'confirmed', timestamp: '2026-07-16T09:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Confirmed - 50 sets' },
      { status: 'processing', timestamp: '2026-07-16T14:00:00Z', location: 'Kampala Warehouse', lat: 0.3400, lng: 32.5800, note: 'Sorting and packing 50 uniform sets' },
      { status: 'picked_up', timestamp: '2026-07-17T08:00:00Z', location: 'Kampala Hub', lat: 0.3476, lng: 32.5825, note: 'Picked up by G4S' },
      { status: 'in_transit', timestamp: '2026-07-17T15:00:00Z', location: 'Katuna Border', lat: -1.4000, lng: 30.2000, note: 'Cleared at Katuna border' },
      { status: 'in_transit', timestamp: '2026-07-18T10:00:00Z', location: 'Musanze', lat: -1.5000, lng: 29.6000, note: 'In transit through Musanze' },
    ],
    customerName: 'Patrick Habimana', customerPhone: '+250788111222',
  },
  // ─── Order 014: Kenya → Tanzania (Delivered) ────────────────────────────
  {
    id: 'ord-014', productName: 'Premium Cotton Formal Shirts', productImage: '👔', quantity: 20, totalAmount: 540000, currency: 'TZS', status: 'delivered',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Dodoma', destinationCountry: 'Tanzania', destinationZone: 'CBD',
    destinationLat: -6.1630, destinationLng: 35.7516, currentLat: -6.1630, currentLng: 35.7516,
    trackingNumber: 'PM-KE-2026-014', carrier: 'PortMetrics Express', createdAt: '2026-07-05T10:00:00Z', estimatedDelivery: '2026-07-12T18:00:00Z', deliveredAt: '2026-07-11T16:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-05T10:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Wholesale order placed' },
      { status: 'confirmed', timestamp: '2026-07-05T10:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-06T09:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Packing 20 shirts in branded boxes' },
      { status: 'picked_up', timestamp: '2026-07-07T07:00:00Z', location: 'Nairobi Hub', lat: -1.2864, lng: 36.8172, note: 'Picked up' },
      { status: 'in_transit', timestamp: '2026-07-08T10:00:00Z', location: 'Arusha', lat: -3.3869, lng: 36.6830, note: 'Through Arusha' },
      { status: 'in_transit', timestamp: '2026-07-09T14:00:00Z', location: 'Singida', lat: -4.8100, lng: 34.7400, note: 'Passed Singida' },
      { status: 'out_for_delivery', timestamp: '2026-07-11T08:00:00Z', location: 'Dodoma', lat: -6.1630, lng: 35.7516, note: 'Out for delivery' },
      { status: 'delivered', timestamp: '2026-07-11T16:00:00Z', location: 'Dodoma', lat: -6.1630, lng: 35.7516, note: 'Delivered - Full batch received' },
    ],
    customerName: 'Hassan Mwinyi', customerPhone: '+255777333444',
  },
  // ─── Order 015: Tanzania → Rwanda (Confirmed) ───────────────────────────
  {
    id: 'ord-015', productName: 'Bamboo Towel Set', productImage: '🛁', quantity: 15, totalAmount: 420000, currency: 'TZS', status: 'confirmed',
    originCity: 'Dar es Salaam', originCountry: 'Tanzania', destinationCity: 'Kigali', destinationCountry: 'Rwanda', destinationZone: 'Nyarugenge',
    destinationLat: -1.9450, destinationLng: 29.8700, currentLat: -6.7924, currentLng: 39.2083,
    trackingNumber: 'PM-TZ-2026-015', carrier: 'DHL Express', createdAt: '2026-07-21T08:00:00Z', estimatedDelivery: '2026-07-28T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T08:00:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-21T08:45:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Confirmed - Export documentation in progress' },
    ],
    customerName: 'Immaculate Nyirahabimana', customerPhone: '+250799444555',
  },
  // ─── Order 016: Kenya Domestic (Processing) ─────────────────────────────
  {
    id: 'ord-016', productName: 'GPS Running Watch', productImage: '⌚', quantity: 2, totalAmount: 130000, currency: 'TZS', status: 'processing',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Eldoret', destinationCountry: 'Kenya', destinationZone: 'Kapsoya',
    destinationLat: 0.5200, destinationLng: 35.2700, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-016', carrier: 'Local Courier', createdAt: '2026-07-21T07:00:00Z', estimatedDelivery: '2026-07-23T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T07:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-21T07:15:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-21T09:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Packing watches with warranty cards' },
    ],
    customerName: 'Brian Kiprop', customerPhone: '+254722666777',
  },
  // ─── Order 017: Uganda Domestic (Delivered) ─────────────────────────────
  {
    id: 'ord-017', productName: 'Aromatherapy Candles', productImage: '🕯️', quantity: 12, totalAmount: 264000, currency: 'TZS', status: 'delivered',
    originCity: 'Kampala', originCountry: 'Uganda', destinationCity: 'Entebbe', destinationCountry: 'Uganda', destinationZone: 'Kitooro',
    destinationLat: 0.0600, destinationLng: 32.4600, currentLat: 0.0600, currentLng: 32.4600,
    trackingNumber: 'PM-UG-2026-017', carrier: 'Local Courier', createdAt: '2026-07-12T11:00:00Z', estimatedDelivery: '2026-07-14T18:00:00Z', deliveredAt: '2026-07-13T14:30:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-12T11:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-12T11:30:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-12T14:00:00Z', location: 'Kampala Warehouse', lat: 0.3400, lng: 32.5800, note: 'Gift wrapping requested' },
      { status: 'picked_up', timestamp: '2026-07-13T08:00:00Z', location: 'Kampala Hub', lat: 0.3476, lng: 32.5825, note: 'Picked up' },
      { status: 'out_for_delivery', timestamp: '2026-07-13T12:00:00Z', location: 'Entebbe', lat: 0.0600, lng: 32.4600, note: 'Out for delivery' },
      { status: 'delivered', timestamp: '2026-07-13T14:30:00Z', location: 'Entebbe', lat: 0.0600, lng: 32.4600, note: 'Delivered at hotel reception' },
    ],
    customerName: 'Claire Mugisha', customerPhone: '+256788333444',
  },
  // ─── Order 018: Rwanda Domestic (In Transit) ────────────────────────────
  {
    id: 'ord-018', productName: 'Hair Extensions Bundle', productImage: '💇', quantity: 5, totalAmount: 425000, currency: 'TZS', status: 'in_transit',
    originCity: 'Kigali', originCountry: 'Rwanda', destinationCity: 'Huye', destinationCountry: 'Rwanda', destinationZone: 'Town Center',
    destinationLat: -2.5930, destinationLng: 29.5920, currentLat: -2.1500, currentLng: 29.8000,
    trackingNumber: 'PM-RW-2026-018', carrier: 'Local Courier', createdAt: '2026-07-19T10:00:00Z', estimatedDelivery: '2026-07-22T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-19T10:00:00Z', location: 'Kigali', lat: -1.9400, lng: 29.8800, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-19T10:30:00Z', location: 'Kigali', lat: -1.9400, lng: 29.8800, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-19T14:00:00Z', location: 'Kigali Warehouse', lat: -1.9400, lng: 29.9000, note: 'Packaging hair extensions' },
      { status: 'picked_up', timestamp: '2026-07-20T08:00:00Z', location: 'Kigali Hub', lat: -1.9400, lng: 29.8800, note: 'Picked up' },
      { status: 'in_transit', timestamp: '2026-07-20T14:00:00Z', location: 'Muhanga', lat: -2.0800, lng: 29.7500, note: 'In transit via Muhanga' },
    ],
    customerName: 'Diane Uwimana', customerPhone: '+250785666777',
  },
  // ─── Order 019: Kenya → Uganda (Returned) ───────────────────────────────
  {
    id: 'ord-019', productName: 'Silk Scarf Collection', productImage: '🧣', quantity: 6, totalAmount: 90000, currency: 'TZS', status: 'returned',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Kampala', destinationCountry: 'Uganda', destinationZone: 'Ntinda',
    destinationLat: 0.3400, destinationLng: 32.5900, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-019', carrier: 'PortMetrics Express', createdAt: '2026-07-01T09:00:00Z', estimatedDelivery: '2026-07-07T18:00:00Z', deliveredAt: '2026-07-06T10:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-01T09:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Order placed' },
      { status: 'confirmed', timestamp: '2026-07-01T09:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-02T10:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Packed' },
      { status: 'picked_up', timestamp: '2026-07-03T08:00:00Z', location: 'Nairobi Hub', lat: -1.2864, lng: 36.8172, note: 'Picked up' },
      { status: 'in_transit', timestamp: '2026-07-04T10:00:00Z', location: 'Malaba Border', lat: 0.6300, lng: 34.2700, note: 'Cleared' },
      { status: 'out_for_delivery', timestamp: '2026-07-06T07:00:00Z', location: 'Kampala', lat: 0.3476, lng: 32.5825, note: 'Out for delivery' },
      { status: 'delivered', timestamp: '2026-07-06T10:00:00Z', location: 'Kampala', lat: 0.3400, lng: 32.5900, note: 'Delivered' },
      { status: 'returned', timestamp: '2026-07-08T14:00:00Z', location: 'Kampala', lat: 0.3400, lng: 32.5900, note: 'Return initiated - Color mismatch with order' },
    ],
    customerName: 'Joan Nabukera', customerPhone: '+256771555666',
  },
  // ─── Order 020: Tanzania Domestic (Placed) ──────────────────────────────
  {
    id: 'ord-020', productName: 'Stainless Steel Utensil Set', productImage: '🍳', quantity: 3, totalAmount: 96000, currency: 'TZS', status: 'placed',
    originCity: 'Dar es Salaam', originCountry: 'Tanzania', destinationCity: 'Arusha', destinationCountry: 'Tanzania', destinationZone: 'Tengeru',
    destinationLat: -3.3500, destinationLng: 36.7200, currentLat: -6.7924, currentLng: 39.2083,
    trackingNumber: 'PM-TZ-2026-020', carrier: 'Local Courier', createdAt: '2026-07-21T11:00:00Z', estimatedDelivery: '2026-07-25T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T11:00:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Order placed - Awaiting confirmation' },
    ],
    customerName: 'John Shirima', customerPhone: '+255789444555',
  },
  // ─── Order 021: Kenya Domestic (Picked Up) ──────────────────────────────
  {
    id: 'ord-021', productName: 'USB-C Hub Multi-Pack', productImage: '🔌', quantity: 10, totalAmount: 350000, currency: 'TZS', status: 'picked_up',
    originCity: 'Nairobi', originCountry: 'Kenya', destinationCity: 'Nakuru', destinationCountry: 'Kenya', destinationZone: 'CBD',
    destinationLat: -0.3031, destinationLng: 36.0800, currentLat: -1.2864, currentLng: 36.8172,
    trackingNumber: 'PM-KE-2026-021', carrier: 'G4S Logistics', createdAt: '2026-07-20T14:00:00Z', estimatedDelivery: '2026-07-22T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-20T14:00:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Bulk order placed' },
      { status: 'confirmed', timestamp: '2026-07-20T14:30:00Z', location: 'Nairobi', lat: -1.2864, lng: 36.8172, note: 'Confirmed' },
      { status: 'processing', timestamp: '2026-07-20T16:00:00Z', location: 'Nairobi Warehouse', lat: -1.2600, lng: 36.8800, note: 'Packing 10 USB-C hubs' },
      { status: 'picked_up', timestamp: '2026-07-21T07:30:00Z', location: 'Nairobi Hub', lat: -1.2864, lng: 36.8172, note: 'Picked up by G4S' },
    ],
    customerName: 'James Ochieng', customerPhone: '+254733888999',
  },
  // ─── Order 022: Tanzania → Kenya (Confirmed) ────────────────────────────
  {
    id: 'ord-022', productName: 'Tanzanian Coffee Beans 5kg', productImage: '☕', quantity: 30, totalAmount: 750000, currency: 'TZS', status: 'confirmed',
    originCity: 'Dar es Salaam', originCountry: 'Tanzania', destinationCity: 'Nairobi', destinationCountry: 'Kenya', destinationZone: 'Lavington',
    destinationLat: -1.2780, destinationLng: 36.7730, currentLat: -6.7924, currentLng: 39.2083,
    trackingNumber: 'PM-TZ-2026-022', carrier: 'DHL Express', createdAt: '2026-07-21T08:30:00Z', estimatedDelivery: '2026-07-27T18:00:00Z',
    events: [
      { status: 'placed', timestamp: '2026-07-21T08:30:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Wholesale coffee order placed' },
      { status: 'confirmed', timestamp: '2026-07-21T09:00:00Z', location: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, note: 'Confirmed - Export certificate being processed' },
    ],
    customerName: 'Alice Njeri', customerPhone: '+254711222333',
  },
];

// ─── Deals Data ────────────────────────────────────────────────────────────

export interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  dealPrice: number;
  currency: string;
  category: string;
  image: string;
  tag: 'flash' | 'bundle' | 'daily' | 'seasonal' | 'clearance';
  endsAt: string;
  claimedCount: number;
  maxClaims: number;
  productId?: string;
}

export const SEED_DEALS: Deal[] = [
  // ─── Flash Sales (8) ───────────────────────────────────────────────────────
  {
    id: 'deal-001', title: 'Flash Sale: Premium Cotton Shirts', description: 'Premium quality cotton shirts at an incredible 40% off for the next 24 hours only. Professional-grade fabric that holds its shape wash after wash.', discount: 40, originalPrice: 27000, dealPrice: 16200, currency: 'TZS', category: "Men's Fashion", image: '👔', tag: 'flash', endsAt: '2026-07-22T23:59:00Z', claimedCount: 145, maxClaims: 200, productId: 'prod-001',
  },
  {
    id: 'deal-002', title: 'Flash: Samsung Galaxy S24 Ultra', description: 'The latest Samsung flagship with S Pen at 35% off. AI-powered camera system and all-day battery. Hurry — limited units!', discount: 35, originalPrice: 550000, dealPrice: 357500, currency: 'TZS', category: 'Technology', image: '📱', tag: 'flash', endsAt: '2026-07-23T18:00:00Z', claimedCount: 87, maxClaims: 100, productId: 'tech-005',
  },
  {
    id: 'deal-003', title: 'Flash: AirPods Pro 2 Deal', description: 'Apple AirPods Pro 2 with USB-C at 30% off. Active Noise Cancellation and Adaptive Transparency. Flash pricing ends tonight!', discount: 30, originalPrice: 95000, dealPrice: 66500, currency: 'TZS', category: 'Audio', image: '🎧', tag: 'flash', endsAt: '2026-07-22T23:59:00Z', claimedCount: 156, maxClaims: 200, productId: 'tech-006',
  },
  {
    id: 'deal-004', title: 'Flash: Women\'s Cocktail Dress', description: 'Stunning sequin cocktail dress at 35% off for 48 hours only. Perfect for weddings and special occasions.', discount: 35, originalPrice: 55000, dealPrice: 35750, currency: 'TZS', category: "Women's Fashion", image: '👗', tag: 'flash', endsAt: '2026-07-24T23:59:00Z', claimedCount: 42, maxClaims: 80, productId: 'prod-017',
  },
  {
    id: 'deal-005', title: 'Flash: MacBook Air M2', description: 'Certified refurbished MacBook Air M2 at 30% off. Liquid Retina display, 18-hour battery. Flash sale ends in 12 hours!', discount: 30, originalPrice: 850000, dealPrice: 595000, currency: 'TZS', category: 'Laptops', image: '💻', tag: 'flash', endsAt: '2026-07-22T12:00:00Z', claimedCount: 23, maxClaims: 30, productId: 'tech-001',
  },
  {
    id: 'deal-006', title: 'Flash: Men\'s Leather Dress Shoes', description: 'Handcrafted Italian leather oxfords at 40% off. Goodyear welt construction for lifetime wear. Limited flash stock!', discount: 40, originalPrice: 65000, dealPrice: 39000, currency: 'TZS', category: "Men's Fashion", image: '👞', tag: 'flash', endsAt: '2026-07-23T12:00:00Z', claimedCount: 34, maxClaims: 50, productId: 'prod-015',
  },
  {
    id: 'deal-007', title: 'Flash: GPS Running Watch', description: 'Multi-sport GPS running watch with heart rate monitor at 35% off. 7-day battery life. Flash deal for athletes!', discount: 35, originalPrice: 65000, dealPrice: 42250, currency: 'TZS', category: 'Wearables', image: '⌚', tag: 'flash', endsAt: '2026-07-24T18:00:00Z', claimedCount: 28, maxClaims: 40, productId: 'sport-008',
  },
  {
    id: 'deal-008', title: 'Flash: Arabian Oud Perfume Oil', description: 'Pure oud oil with rose and amber at 30% off. 24-hour fragrance with just a few drops. Flash pricing ends soon!', discount: 30, originalPrice: 35000, dealPrice: 24500, currency: 'TZS', category: 'Fragrance', image: '🌹', tag: 'flash', endsAt: '2026-07-22T20:00:00Z', claimedCount: 52, maxClaims: 80, productId: 'beauty-006',
  },

  // ─── Bundle Deals (8) ──────────────────────────────────────────────────────
  {
    id: 'deal-009', title: 'Tech Power Bundle: MacBook + AirPods', description: 'Get the MacBook Air M2 + AirPods Pro 2 bundle and save 20%. The perfect work-from-anywhere setup at one incredible price.', discount: 20, originalPrice: 945000, dealPrice: 756000, currency: 'TZS', category: 'Technology', image: '💻', tag: 'bundle', endsAt: '2026-08-05T00:00:00Z', claimedCount: 32, maxClaims: 50, productId: 'tech-001',
  },
  {
    id: 'deal-010', title: 'Audio Masters Bundle', description: 'Sony WH-1000XM5 + AirPods Pro 2. Premium noise-cancelling headphones plus wireless earbuds at 18% off.', discount: 18, originalPrice: 275000, dealPrice: 225500, currency: 'TZS', category: 'Technology', image: '🎧', tag: 'bundle', endsAt: '2026-08-01T00:00:00Z', claimedCount: 56, maxClaims: 75,
  },
  {
    id: 'deal-011', title: 'Wholesale Bale Mega Deal', description: 'Buy 3+ wholesale bales and get 25% off. Perfect for market traders and boutique owners building inventory.', discount: 25, originalPrice: 700000, dealPrice: 525000, currency: 'TZS', category: 'Wholesale', image: '📦', tag: 'bundle', endsAt: '2026-08-10T00:00:00Z', claimedCount: 18, maxClaims: 30,
  },
  {
    id: 'deal-012', title: 'USB-C Hub Multi-Pack', description: 'Buy 5 USB-C 7-in-1 Hubs at the price of 3. Perfect for offices and co-working spaces. Save 40%!', discount: 40, originalPrice: 35000, dealPrice: 21000, currency: 'TZS', category: 'Technology', image: '🔌', tag: 'bundle', endsAt: '2026-08-08T00:00:00Z', claimedCount: 93, maxClaims: 200, productId: 'tech-007',
  },
  {
    id: 'deal-013', title: 'Handbags + Silk Scarf Bundle', description: 'Premium handbag paired with a hand-rolled silk scarf at 22% off. Elevate your accessory game instantly.', discount: 22, originalPrice: 37000, dealPrice: 28860, currency: 'TZS', category: 'Accessories', image: '👜', tag: 'bundle', endsAt: '2026-08-03T00:00:00Z', claimedCount: 67, maxClaims: 150, productId: 'prod-004',
  },
  {
    id: 'deal-014', title: 'Grooming Essentials Bundle', description: 'Beard Grooming Kit + Arabian Oud Perfume. Complete gentlemen\'s care set at 20% off. Gift-ready packaging included.', discount: 20, originalPrice: 65000, dealPrice: 52000, currency: 'TZS', category: 'Grooming', image: '🪒', tag: 'bundle', endsAt: '2026-08-06T00:00:00Z', claimedCount: 24, maxClaims: 60,
  },
  {
    id: 'deal-015', title: 'Skincare + Hair Care Bundle', description: 'Complete Luxury Skincare Set plus Hair Care Essentials at 18% off. Full beauty routine in one purchase.', discount: 18, originalPrice: 83000, dealPrice: 68060, currency: 'TZS', category: 'Beauty', image: '✨', tag: 'bundle', endsAt: '2026-08-04T00:00:00Z', claimedCount: 38, maxClaims: 80,
  },
  {
    id: 'deal-016', title: 'Home Starter Bundle', description: 'Egyptian Cotton Bed Sheets + Bamboo Towel Set + Aromatherapy Candles. Complete home makeover at 22% off.', discount: 22, originalPrice: 102000, dealPrice: 79560, currency: 'TZS', category: 'Home', image: '🏠', tag: 'bundle', endsAt: '2026-08-07T00:00:00Z', claimedCount: 15, maxClaims: 40,
  },

  // ─── Daily Deals (8) ───────────────────────────────────────────────────────
  {
    id: 'deal-017', title: 'Daily Deal: Women\'s Yoga Leggings', description: 'High-performance compression leggings with moisture-wicking technology at 20% off. Squat-proof and buttery soft.', discount: 20, originalPrice: 18000, dealPrice: 14400, currency: 'TZS', category: "Women's Fashion", image: '👖', tag: 'daily', endsAt: '2026-07-23T00:00:00Z', claimedCount: 289, maxClaims: 500, productId: 'prod-022',
  },
  {
    id: 'deal-018', title: 'Daily Deal: Dell XPS 15 Laptop', description: 'Professional-grade Dell XPS 15 with Intel i7 and OLED display at 15% off. Perfect for business professionals.', discount: 15, originalPrice: 720000, dealPrice: 612000, currency: 'TZS', category: 'Laptops', image: '💻', tag: 'daily', endsAt: '2026-07-23T00:00:00Z', claimedCount: 15, maxClaims: 25, productId: 'tech-004',
  },
  {
    id: 'deal-019', title: 'Daily: Men\'s Tracksuit Set', description: 'Full zip-up tracksuit with jogger pants at 18% off. Soft fleece lining for cooler mornings. Daily deal price!', discount: 18, originalPrice: 45000, dealPrice: 36900, currency: 'TZS', category: "Men's Fashion", image: '🏃', tag: 'daily', endsAt: '2026-07-24T00:00:00Z', claimedCount: 88, maxClaims: 200, productId: 'prod-010',
  },
  {
    id: 'deal-020', title: 'Daily: Aviator Sunglasses', description: 'Classic aviator sunglasses with polarized UV400 lenses at 15% off. Iconic style for sunny East African days.', discount: 15, originalPrice: 18000, dealPrice: 15300, currency: 'TZS', category: 'Accessories', image: '🕶️', tag: 'daily', endsAt: '2026-07-24T00:00:00Z', claimedCount: 175, maxClaims: 300, productId: 'prod-042',
  },
  {
    id: 'deal-021', title: 'Daily: Kenyan AA Coffee Beans', description: 'Single-origin Kenyan AA coffee at 12% off. Bright acidity with blackcurrant notes. Freshly roasted to order.', discount: 12, originalPrice: 25000, dealPrice: 22000, currency: 'TZS', category: 'Coffee', image: '☕', tag: 'daily', endsAt: '2026-07-25T00:00:00Z', claimedCount: 112, maxClaims: 250, productId: 'food-001',
  },
  {
    id: 'deal-022', title: 'Daily: Men\'s Leather Wallet', description: 'RFID-blocking slim bifold wallet at 15% off. Premium leather with 8 card slots and coin pocket.', discount: 15, originalPrice: 20000, dealPrice: 17000, currency: 'TZS', category: 'Accessories', image: '👛', tag: 'daily', endsAt: '2026-07-23T00:00:00Z', claimedCount: 198, maxClaims: 300, productId: 'prod-046',
  },
  {
    id: 'deal-023', title: 'Daily: Yoga Mat + Resistance Bands', description: 'Premium TPE yoga mat plus resistance band set at 18% off. Everything you need for home workouts.', discount: 18, originalPrice: 37000, dealPrice: 30340, currency: 'TZS', category: 'Fitness', image: '🧘', tag: 'daily', endsAt: '2026-07-25T00:00:00Z', claimedCount: 64, maxClaims: 150,
  },
  {
    id: 'deal-024', title: 'Daily: Dark Chocolate Collection', description: 'Single-origin Tanzanian dark chocolate at 10% off. 72% cacao with fruity undertones. A treat for connoisseurs.', discount: 10, originalPrice: 15000, dealPrice: 13500, currency: 'TZS', category: 'Chocolate', image: '🍫', tag: 'daily', endsAt: '2026-07-24T00:00:00Z', claimedCount: 220, maxClaims: 400, productId: 'food-006',
  },

  // ─── Seasonal Deals (4) ────────────────────────────────────────────────────
  {
    id: 'deal-025', title: 'Summer Style: Linen Shirt Set', description: 'Breezy linen shirt and pants set at 25% off. Embrace the tropical season in effortless style. Limited seasonal run.', discount: 25, originalPrice: 42000, dealPrice: 31500, currency: 'TZS', category: "Men's Fashion", image: '🌴', tag: 'seasonal', endsAt: '2026-08-15T00:00:00Z', claimedCount: 42, maxClaims: 120, productId: 'prod-014',
  },
  {
    id: 'deal-026', title: 'Back to School: Uniform Bundle', description: 'Boys\' school uniform sets at 20% off. Reinforced seams and stain-resistant fabric. Stock up before the term starts!', discount: 20, originalPrice: 18000, dealPrice: 14400, currency: 'TZS', category: 'Kids', image: '🎒', tag: 'seasonal', endsAt: '2026-08-20T00:00:00Z', claimedCount: 55, maxClaims: 200, productId: 'prod-031',
  },
  {
    id: 'deal-027', title: 'Beach Ready: Swim Trunks + Sunglasses', description: 'Quick-dry swim trunks paired with polarized sunglasses at 22% off. Your complete beach and pool essentials.', discount: 22, originalPrice: 30000, dealPrice: 23400, currency: 'TZS', category: 'Fashion', image: '🏖️', tag: 'seasonal', endsAt: '2026-08-10T00:00:00Z', claimedCount: 38, maxClaims: 100,
  },
  {
    id: 'deal-028', title: 'Spice Up Your Kitchen: Spice Mix Collection', description: 'Five authentic East African spice blends at 15% off. Pilau, Curry, Mchuzi, Tikka, and Biryani in one curated box.', discount: 15, originalPrice: 12000, dealPrice: 10200, currency: 'TZS', category: 'Spices', image: '🫙', tag: 'seasonal', endsAt: '2026-08-05T00:00:00Z', claimedCount: 78, maxClaims: 200, productId: 'food-007',
  },

  // ─── Clearance Deals (4) ───────────────────────────────────────────────────
  {
    id: 'deal-029', title: 'Clearance: Men\'s Swim Trunks', description: 'End-of-season clearance on swim trunks — 50% off! Quick-dry fabric with mesh lining. Grab yours before they sell out.', discount: 50, originalPrice: 12000, dealPrice: 6000, currency: 'TZS', category: "Men's Fashion", image: '🩳', tag: 'clearance', endsAt: '2026-07-28T00:00:00Z', claimedCount: 312, maxClaims: 500, productId: 'prod-009',
  },
  {
    id: 'deal-030', title: 'Clearance: Crop Top Collection', description: 'Trendy crop tops at 45% off clearance. Ribbed cotton-spandex in assorted colours. Last chance pricing!', discount: 45, originalPrice: 12000, dealPrice: 6600, currency: 'TZS', category: "Women's Fashion", image: '👚', tag: 'clearance', endsAt: '2026-07-27T00:00:00Z', claimedCount: 178, maxClaims: 400, productId: 'prod-028',
  },
  {
    id: 'deal-031', title: 'Clearance: Baby Rummage 25kg', description: 'Premium infant romper assortment at 40% off. Pre-washed, grade A+ European labels. Ultimate clearance bargain!', discount: 40, originalPrice: 7500, dealPrice: 4500, currency: 'TZS', category: 'Kids', image: '👶', tag: 'clearance', endsAt: '2026-07-26T00:00:00Z', claimedCount: 145, maxClaims: 200, productId: 'prod-037',
  },
  {
    id: 'deal-032', title: 'Clearance: Knit Cardigan', description: 'Merino-blend cardigans at 55% off end-of-season clearance. Shawl collar elegance at rock-bottom prices.', discount: 55, originalPrice: 32000, dealPrice: 14400, currency: 'TZS', category: "Men's Fashion", image: '🧶', tag: 'clearance', endsAt: '2026-07-25T00:00:00Z', claimedCount: 89, maxClaims: 130, productId: 'prod-013',
  },
];
