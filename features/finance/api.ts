import { apiClient } from "@/lib/api/client";
import type { PaginatedLedger, SepInitiateResponse, Wallet } from "./types";

export const financeApi = {
  wallet(): Promise<Wallet> {
    return apiClient.get("/finance/wallet/");
  },

  ledger(page = 1, pageSize = 20): Promise<PaginatedLedger> {
    return apiClient.get(
      `/finance/wallet/ledger/?page=${page}&page_size=${pageSize}`,
    );
  },

  sepInitiate(amount: number, purpose = "wallet-topup"): Promise<SepInitiateResponse> {
    return apiClient.post("/finance/sep/initiate/", { amount, purpose });
  },
};
