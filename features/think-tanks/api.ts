import {
  thinkTankLogos,
  type ThinkTankLogo,
} from "@/app/_data/landing";
import type { ThinkTank } from "./types";

/**
 * Think-tank data access.
 * Currently backed by local `_data` until `apps.institutes.think_tanks`
 * exposes `/api/v1/institutes/think-tanks/`. Swap the implementations
 * here without touching UI components.
 */
function toThinkTank(item: ThinkTankLogo): ThinkTank {
  return {
    slug: item.slug,
    src: item.src,
    alt: item.alt,
    title: item.title,
    description: item.description,
  };
}

export async function listThinkTanks(): Promise<ThinkTank[]> {
  return thinkTankLogos.map(toThinkTank);
}

export async function getThinkTankBySlug(
  slug: string,
): Promise<ThinkTank | null> {
  const item = thinkTankLogos.find((logo) => logo.slug === slug);
  return item ? toThinkTank(item) : null;
}
