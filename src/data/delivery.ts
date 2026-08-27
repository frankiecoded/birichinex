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
  kind?: "order" | "shipment";
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


// ═══════════════════════════════════════════════════════════════════════════
// ─── Business Shipments (geo-enabled, render on the live tracking map) ─────
// ═══════════════════════════════════════════════════════════════════════════

export type ShipmentType = "import" | "export";
export type CustomsStatus = "pending" | "cleared" | "held" | "processing";

export interface TrackedShipment {
  id: string;
  kind: "shipment";
  title: string;
  weight: number;
  weightUnit: string;
  totalAmount: number;
  currency: Currency;
  status: TrackingStatus;
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  originLat: number;
  originLng: number;
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
  consignee: string;
  contactPhone: string;
  type: ShipmentType;
  customsStatus: CustomsStatus;
  customsDocumentRef: string;
}

// Global hub / transit coords used to place international shipments on the map.
const WORLD_COORDS: Record<string, { lat: number; lng: number }> = {
  Milan: { lat: 45.4642, lng: 9.19 },
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Guangzhou: { lat: 23.1291, lng: 113.2644 },
  Shenzhen: { lat: 22.5431, lng: 114.0579 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Lagos: { lat: 6.5244, lng: 3.3792 },
  Kampala: { lat: 0.3476, lng: 32.5825 },
  Kigali: { lat: -1.9441, lng: 30.0619 },
  AddisAbaba: { lat: 8.9806, lng: 38.7578 },
  Nairobi: { lat: -1.2921, lng: 36.8219 },
  Mombasa: { lat: -4.0435, lng: 39.6682 },
  DarEsSalaam: { lat: -6.7924, lng: 39.2083 },
  Malaba: { lat: 0.6305, lng: 34.2706 },
};

export function resolveCityCoords(city: string, country: string): { lat: number; lng: number } {
  const normalized = city.trim().toLowerCase().replace(/[^a-z]/g, "");
  for (const [key, coords] of Object.entries(WORLD_COORDS)) {
    if (key.toLowerCase().replace(/[^a-z]/g, "") === normalized) return coords;
  }
  const cityPricing = getCityPricing(city.trim(), country.trim());
  if (cityPricing) return { lat: cityPricing.lat, lng: cityPricing.lng };
  const countryFallback: Record<string, { lat: number; lng: number }> = {
    Kenya: { lat: -0.0236, lng: 37.9062 },
    Tanzania: { lat: -6.369, lng: 34.8888 },
    Uganda: { lat: 1.3733, lng: 32.2903 },
    Rwanda: { lat: -1.9403, lng: 29.8739 },
    Italy: { lat: 41.8719, lng: 12.5674 },
    Netherlands: { lat: 52.1326, lng: 5.2913 },
    China: { lat: 35.8617, lng: 104.1954 },
    Nigeria: { lat: 9.082, lng: 8.6753 },
  };
  const fallback = countryFallback[country.trim()] ?? { lat: 0, lng: 20 };
  return fallback;
}

