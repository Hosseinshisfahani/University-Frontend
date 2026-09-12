import {
  PsyApproach,
  PsyClosingCta,
  PsyHero,
  PsyHow,
  PsyNewsSlider,
  PsyServices,
} from "@/app/(institutes)/(psy_institute)/(psy)/_components/landing";

export const metadata = {
  title: "مرکز مشاوره آیه",
  description:
    "آیه؛ نشانیِ یک حالِ خوب — مشاوره، نوبت‌دهی، آزمون‌های روان‌سنجی و پورتال مراجعان.",
};

export default function PsyLandingPage() {
  return (
    <>
      <PsyHero />
      <PsyNewsSlider />
      <PsyApproach />
      <PsyServices />
      <PsyHow />
      <PsyClosingCta />
    </>
  );
}
