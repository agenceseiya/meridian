import type { NormalizedEvent } from "../types";

const NEWSAPI_BASE = "https://newsapi.org/v2/everything";

interface NewsAPIArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export async function fetchNewsAPI(
  sourceId: string
): Promise<NormalizedEvent[]> {
  const apiKey = process.env.NEWSAPI_ORG_KEY;
  if (!apiKey) {
    throw new Error("NEWSAPI_ORG_KEY not configured");
  }

  const query = encodeURIComponent(
    '(Iran OR Israel OR IRGC OR IDF OR "Middle East") AND (military OR nuclear OR sanctions OR conflict OR attack)'
  );

  const url = `${NEWSAPI_BASE}?q=${query}&language=en&sortBy=publishedAt&pageSize=20`;

  const response = await fetch(url, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NewsAPI error ${response.status}: ${text}`);
  }

  const data = await response.json();
  const articles: NewsAPIArticle[] = data.articles || [];

  return articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .map((article) => ({
      externalId: article.url,
      title: article.title,
      summary: article.description?.slice(0, 500),
      content: article.content?.slice(0, 5000),
      url: article.url,
      imageUrl: article.urlToImage ?? undefined,
      publishedAt: new Date(article.publishedAt),
      sourceType: "news_api" as const,
      sourceId,
      tags: [article.source.name].filter(Boolean),
      rawData: {
        source: article.source,
        author: article.author,
      },
    }));
}
