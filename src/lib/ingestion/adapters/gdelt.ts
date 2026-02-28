import type { NormalizedEvent } from "../types";

const GDELT_DOC_API =
  "https://api.gdeltproject.org/api/v2/doc/doc";
const GDELT_GEO_API =
  "https://api.gdeltproject.org/api/v2/geo/geo";

interface GDELTArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
  tone: number;
}

interface GDELTGeoFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    name: string;
    url: string;
    urltone: number;
    urlsocialimage: string;
    domain: string;
    seendate: string;
    sharingimage: string;
  };
}

export async function fetchGDELTArticles(
  sourceId: string
): Promise<NormalizedEvent[]> {
  const query = encodeURIComponent(
    '(Iran OR Israel OR IDF OR IRGC OR "Persian Gulf" OR "Strait of Hormuz" OR Hezbollah OR Hamas) (conflict OR military OR nuclear OR sanctions OR diplomatic OR attack OR missile OR drone)'
  );

  const url = `${GDELT_DOC_API}?query=${query}&mode=artlist&maxrecords=50&format=json&sort=datedesc`;

  const response = await fetch(url, {
    headers: { "User-Agent": "MERIDIAN-OSINT/1.0" },
    next: { revalidate: 900 }, // Cache 15 min
  });

  if (!response.ok) {
    throw new Error(`GDELT DOC API error: ${response.status}`);
  }

  const data = await response.json();
  const articles: GDELTArticle[] = data.articles || [];

  return articles.map((article) => ({
    externalId: article.url,
    title: article.title,
    url: article.url,
    imageUrl: article.socialimage,
    publishedAt: parseGDELTDate(article.seendate),
    sourceType: "gdelt" as const,
    sourceId,
    tags: [article.domain, article.sourcecountry].filter(Boolean),
    rawData: {
      domain: article.domain,
      language: article.language,
      sourcecountry: article.sourcecountry,
      tone: article.tone,
    },
  }));
}

export async function fetchGDELTGeo(
  sourceId: string
): Promise<NormalizedEvent[]> {
  const query = encodeURIComponent(
    "Iran OR Israel OR IRGC OR IDF"
  );

  const url = `${GDELT_GEO_API}?query=${query}&format=geojson&maxpoints=100`;

  const response = await fetch(url, {
    headers: { "User-Agent": "MERIDIAN-OSINT/1.0" },
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`GDELT GEO API error: ${response.status}`);
  }

  const data = await response.json();
  const features: GDELTGeoFeature[] = data.features || [];

  return features.map((feature) => ({
    externalId: feature.properties.url,
    title: feature.properties.name || "GDELT Geo Event",
    url: feature.properties.url,
    imageUrl: feature.properties.urlsocialimage || feature.properties.sharingimage,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    locationName: feature.properties.name,
    publishedAt: parseGDELTDate(feature.properties.seendate),
    sourceType: "gdelt" as const,
    sourceId,
    rawData: {
      domain: feature.properties.domain,
      tone: feature.properties.urltone,
    },
  }));
}

function parseGDELTDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // GDELT format: "20260228T120000Z" or similar
  const clean = dateStr.replace(/T/, " ").replace(/Z/, "");
  const parsed = new Date(clean);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}
