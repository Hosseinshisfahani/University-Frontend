import { newsItems as localNews } from "@/app/_data/news";
import type { NewsItem } from "./types";

/**
 * News data access.
 * Currently backed by local `_data` until a news domain app exposes
 * `/api/v1/...`. Swap implementations here without touching UI.
 */
export async function listNews(): Promise<NewsItem[]> {
  return localNews.map((item) => ({ ...item }));
}
