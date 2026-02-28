import { KNOWN_LOCATIONS } from "./constants";

interface GeoResult {
  latitude: number;
  longitude: number;
  locationName: string;
  country: "IR" | "US" | "IL" | "OTHER";
}

const locationPatterns = Object.entries(KNOWN_LOCATIONS).map(
  ([key, value]) => ({
    patterns: [
      key.replace(/_/g, " "),
      key.replace(/_/g, "-"),
      key,
    ],
    ...value,
    name: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  })
);

export function extractLocation(text: string): GeoResult | null {
  const lower = text.toLowerCase();

  for (const loc of locationPatterns) {
    for (const pattern of loc.patterns) {
      if (lower.includes(pattern)) {
        return {
          latitude: loc.lat,
          longitude: loc.lng,
          locationName: loc.name,
          country: loc.country,
        };
      }
    }
  }

  return null;
}

export function detectCountries(
  text: string
): ("IR" | "US" | "IL" | "OTHER")[] {
  const lower = text.toLowerCase();
  const countries: ("IR" | "US" | "IL" | "OTHER")[] = [];

  const iranKeywords = [
    "iran",
    "iranian",
    "tehran",
    "irgc",
    "khamenei",
    "rouhani",
    "raisi",
    "persian gulf",
    "hezbollah",
    "natanz",
    "fordow",
  ];
  const usKeywords = [
    "united states",
    "u.s.",
    "us ",
    "american",
    "pentagon",
    "washington",
    "biden",
    "state department",
    "centcom",
    "us military",
  ];
  const israelKeywords = [
    "israel",
    "israeli",
    "idf",
    "netanyahu",
    "mossad",
    "tel aviv",
    "jerusalem",
    "gaza",
    "west bank",
    "hamas",
  ];

  if (iranKeywords.some((k) => lower.includes(k))) countries.push("IR");
  if (usKeywords.some((k) => lower.includes(k))) countries.push("US");
  if (israelKeywords.some((k) => lower.includes(k))) countries.push("IL");

  return countries.length > 0 ? countries : ["OTHER"];
}
