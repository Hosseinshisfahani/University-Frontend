"use client";

import { useQuery } from "@tanstack/react-query";
import { listNews } from "./api";

export const newsKeys = {
  all: ["news"] as const,
};

export function useNews() {
  return useQuery({
    queryKey: newsKeys.all,
    queryFn: listNews,
  });
}
