// Middle East bounding box for map and queries
export const ME_BOUNDS = {
  latMin: 12,
  lonMin: 25,
  latMax: 42,
  lonMax: 65,
} as const;

// Strait of Hormuz focus area
export const HORMUZ_BOUNDS = {
  latMin: 25.5,
  lonMin: 54.5,
  latMax: 27.5,
  lonMax: 57.5,
} as const;

// Red Sea / Bab el-Mandeb focus area
export const RED_SEA_BOUNDS = {
  latMin: 12,
  lonMin: 42,
  latMax: 15,
  lonMax: 44.5,
} as const;

// Threat level colors
export const THREAT_COLORS: Record<string, string> = {
  "1": "#22c55e", // green
  "2": "#eab308", // yellow
  "3": "#f97316", // orange
  "4": "#ef4444", // red
  "5": "#dc2626", // crimson
} as const;

export const THREAT_LABELS: Record<string, string> = {
  "1": "Routine",
  "2": "Noteworthy",
  "3": "Elevated",
  "4": "High",
  "5": "Critical",
} as const;

// Country codes and labels
export const COUNTRIES = {
  IR: { name: "Iran", flag: "🇮🇷" },
  US: { name: "United States", flag: "🇺🇸" },
  IL: { name: "Israel", flag: "🇮🇱" },
  OTHER: { name: "Other", flag: "🌍" },
} as const;

// Source type labels
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  news_api: "News API",
  gdelt: "GDELT",
  rss: "RSS Feed",
  twitter: "X/Twitter",
  telegram: "Telegram",
  flight_tracker: "Flight Tracker",
  ship_tracker: "Ship Tracker",
  government_feed: "Government",
} as const;

// Event type labels
export const EVENT_TYPE_LABELS: Record<string, string> = {
  military_movement: "Military Movement",
  diplomatic: "Diplomatic",
  conflict: "Conflict",
  protest: "Protest",
  sanctions: "Sanctions",
  nuclear: "Nuclear",
  cyber: "Cyber",
  terrorism: "Terrorism",
  humanitarian: "Humanitarian",
  political: "Political",
  economic: "Economic",
  maritime: "Maritime",
  aviation: "Aviation",
  other: "Other",
} as const;

// Map default center (Middle East)
export const MAP_DEFAULT_CENTER = {
  latitude: 30,
  longitude: 45,
  zoom: 4,
} as const;

// Refresh interval in ms
export const REFRESH_INTERVAL_MS = 60_000;

// RSS feed URLs for initial sources
export const RSS_FEEDS = [
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    type: "rss" as const,
  },
  {
    name: "Times of Israel",
    url: "https://www.timesofisrael.com/feed/",
    type: "rss" as const,
  },
  {
    name: "IRNA English",
    url: "https://en.irna.ir/rss",
    type: "rss" as const,
  },
  {
    name: "Google News - Iran Israel",
    url: "https://news.google.com/rss/search?q=Iran+Israel+US+Middle+East&hl=en",
    type: "rss" as const,
  },
  {
    name: "US State Department",
    url: "https://www.state.gov/rss-feed/press-releases/feed/",
    type: "government_feed" as const,
  },
  {
    name: "US DoD News",
    url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1",
    type: "government_feed" as const,
  },
] as const;

// Known Middle East locations with coordinates for geocoding
export const KNOWN_LOCATIONS: Record<
  string,
  { lat: number; lng: number; country: "IR" | "US" | "IL" | "OTHER" }
> = {
  // Iran
  tehran: { lat: 35.6892, lng: 51.389, country: "IR" },
  isfahan: { lat: 32.6546, lng: 51.668, country: "IR" },
  tabriz: { lat: 38.08, lng: 46.2919, country: "IR" },
  shiraz: { lat: 29.5918, lng: 52.5837, country: "IR" },
  mashhad: { lat: 36.2605, lng: 59.6168, country: "IR" },
  qom: { lat: 34.6401, lng: 50.8764, country: "IR" },
  ahvaz: { lat: 31.3183, lng: 48.6706, country: "IR" },
  bushehr: { lat: 28.9234, lng: 50.8203, country: "IR" },
  bandar_abbas: { lat: 27.1832, lng: 56.2666, country: "IR" },
  natanz: { lat: 33.5131, lng: 51.9176, country: "IR" },
  fordow: { lat: 34.708, lng: 51.2308, country: "IR" },
  parchin: { lat: 35.5226, lng: 51.7749, country: "IR" },
  arak: { lat: 34.0917, lng: 49.6892, country: "IR" },
  chabahar: { lat: 25.2919, lng: 60.643, country: "IR" },
  kharg_island: { lat: 29.2333, lng: 50.3167, country: "IR" },

  // Israel
  jerusalem: { lat: 31.7683, lng: 35.2137, country: "IL" },
  tel_aviv: { lat: 32.0853, lng: 34.7818, country: "IL" },
  haifa: { lat: 32.7940, lng: 34.9896, country: "IL" },
  beer_sheva: { lat: 31.2518, lng: 34.7913, country: "IL" },
  dimona: { lat: 31.0697, lng: 35.0324, country: "IL" },
  eilat: { lat: 29.5577, lng: 34.9519, country: "IL" },
  negev: { lat: 30.8, lng: 34.8, country: "IL" },
  golan_heights: { lat: 33.0, lng: 35.8, country: "IL" },
  west_bank: { lat: 31.9, lng: 35.3, country: "IL" },
  gaza: { lat: 31.5, lng: 34.47, country: "OTHER" },
  rafah: { lat: 31.28, lng: 34.24, country: "OTHER" },

  // US bases / assets in region
  al_udeid: { lat: 25.1173, lng: 51.315, country: "US" },
  camp_arifjan: { lat: 29.1447, lng: 48.0778, country: "US" },
  al_dhafra: { lat: 24.2481, lng: 54.5479, country: "US" },
  bahrain_naval: { lat: 26.2285, lng: 50.588, country: "US" },
  incirlik: { lat: 37.0017, lng: 35.4259, country: "US" },
  diego_garcia: { lat: -7.3133, lng: 72.4111, country: "US" },

  // Key waterways
  strait_of_hormuz: { lat: 26.5667, lng: 56.25, country: "OTHER" },
  bab_el_mandeb: { lat: 12.5833, lng: 43.3333, country: "OTHER" },
  suez_canal: { lat: 30.45, lng: 32.35, country: "OTHER" },

  // Regional
  baghdad: { lat: 33.3128, lng: 44.3615, country: "OTHER" },
  damascus: { lat: 33.5138, lng: 36.2765, country: "OTHER" },
  beirut: { lat: 33.8938, lng: 35.5018, country: "OTHER" },
  amman: { lat: 31.9454, lng: 35.9284, country: "OTHER" },
  riyadh: { lat: 24.7136, lng: 46.6753, country: "OTHER" },
  doha: { lat: 25.2854, lng: 51.531, country: "OTHER" },
  abu_dhabi: { lat: 24.4539, lng: 54.3773, country: "OTHER" },
  dubai: { lat: 25.2048, lng: 55.2708, country: "OTHER" },
  ankara: { lat: 39.9334, lng: 32.8597, country: "OTHER" },
  cairo: { lat: 30.0444, lng: 31.2357, country: "OTHER" },
  sanaa: { lat: 15.3694, lng: 44.191, country: "OTHER" },
  aden: { lat: 12.7855, lng: 45.0187, country: "OTHER" },
  muscat: { lat: 23.588, lng: 58.3829, country: "OTHER" },
  kuwait_city: { lat: 29.3759, lng: 47.9774, country: "OTHER" },
  persian_gulf: { lat: 26.0, lng: 52.0, country: "OTHER" },
  red_sea: { lat: 20.0, lng: 38.0, country: "OTHER" },
  mediterranean: { lat: 34.0, lng: 32.0, country: "OTHER" },
  arabian_sea: { lat: 18.0, lng: 62.0, country: "OTHER" },
};
