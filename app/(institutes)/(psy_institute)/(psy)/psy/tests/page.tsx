import { TestsPublicList } from "@/app/(institutes)/(psy_institute)/(psy)/_components/tests";

export const metadata = {
  title: "آزمون‌های روان‌سنجی",
  description: "پرسشنامه‌های روان‌سنجی مرکز روان‌شناسی دانشگاه.",
};

export default function PsyTestsPage() {
  return <TestsPublicList />;
}
