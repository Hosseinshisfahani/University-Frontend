import { apiClient } from "@/lib/api/client";
import type { PaginatedLedger, FinancePayment, VandarInitiateResponse, Wallet } from "./types";

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

  payment(id: number): Promise<FinancePayment> {
    return apiClient.get(`/finance/payments/${id}/`);
  },
};
