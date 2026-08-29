import PsyFooter from "@/app/(institutes)/(psy_institute)/(psy)/_components/footer";
import PsyHeader from "@/app/(institutes)/(psy_institute)/(psy)/_components/header";
import "@/app/(institutes)/(psy_institute)/_shared/psy.css";

export default function PsyMarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="psy-root flex min-h-screen flex-col">
      <PsyHeader />
      <main className="flex-1">{children}</main>
      <PsyFooter />
    </div>
  );
}
