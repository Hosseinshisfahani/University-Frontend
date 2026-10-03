import { apiClient } from "@/lib/api/client";
import type { PaginatedLedger, VandarInitiateResponse, Wallet } from "./types";

export const financeApi = {
  wallet(): Promise<Wallet> {
    return apiClient.get("/finance/wallet/");
  },

  ledger(page = 1, pageSize = 20): Promise<PaginatedLedger> {
    return apiClient.get(
      `/finance/wallet/ledger/?page=${page}&page_size=${pageSize}`,
    );
  },

  vandarInitiate(amount: number, purpose = "wallet-topup"): Promise<VandarInitiateResponse> {
    return apiClient.post("/finance/vandar/initiate/", { amount, purpose });
  },
};
