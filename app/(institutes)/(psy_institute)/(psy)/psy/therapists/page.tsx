import { PsyTherapists } from "@/app/(institutes)/(psy_institute)/(psy)/_components/therapists";

export const metadata = {
  title: "درمانگران",
  description: "آشنایی با درمانگران مرکز روان‌شناسی و رزرو نوبت.",
};

export default async function PsyTherapistsPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  return <PsyTherapists service={service} />;
}
