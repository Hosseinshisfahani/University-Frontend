"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { financeApi } from "./api";

export const financeKeys = {
  wallet: ["finance", "wallet"] as const,
  ledger: (page: number) => ["finance", "ledger", page] as const,
};

export function useWallet() {
  return useQuery({
    queryKey: financeKeys.wallet,
    queryFn: () => financeApi.wallet(),
  });
}

export function useLedger(page: number) {
  return useQuery({
    queryKey: financeKeys.ledger(page),
    queryFn: () => financeApi.ledger(page),
  });
}

export function useSepInitiate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => financeApi.sepInitiate(amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.wallet });
      window.location.href = data.redirect_url;
    },
  });
}
