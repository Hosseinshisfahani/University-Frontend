"use client";

import { useQuery } from "@tanstack/react-query";
import { getThinkTankBySlug, listThinkTanks } from "./api";

export const thinkTankKeys = {
  all: ["think-tanks"] as const,
  detail: (slug: string) => ["think-tanks", slug] as const,
};

export function useThinkTanks() {
  return useQuery({
    queryKey: thinkTankKeys.all,
    queryFn: listThinkTanks,
  });
}

export function useThinkTank(slug: string) {
  return useQuery({
    queryKey: thinkTankKeys.detail(slug),
    queryFn: () => getThinkTankBySlug(slug),
    enabled: Boolean(slug),
  });
}
