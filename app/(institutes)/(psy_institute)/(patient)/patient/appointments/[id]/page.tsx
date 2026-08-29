import { AppointmentDetailClient } from "@/app/(institutes)/(psy_institute)/(patient)/_components/appointments";

type Props = { params: Promise<{ id: string }> };

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  return <AppointmentDetailClient id={Number(id)} />;
}
