import { TherapistAppointmentDetail } from "@/app/(institutes)/(psy_institute)/(therapist)/_components/appointments";

type Props = { params: Promise<{ id: string }> };

export default async function TherapistAppointmentDetailPage({ params }: Props) {
  const { id } = await params;
  return <TherapistAppointmentDetail id={Number(id)} />;
}
