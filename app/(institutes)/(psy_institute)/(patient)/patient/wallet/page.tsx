import { Suspense } from "react";
import WalletPageClient from "@/features/finance/components/WalletPageClient";

export default function WalletPage() {
  return (
    <Suspense fallback={<p className="text-sm opacity-60">در حال بارگذاری…</p>}>
      <WalletPageClient />
    </Suspense>
  );
}
