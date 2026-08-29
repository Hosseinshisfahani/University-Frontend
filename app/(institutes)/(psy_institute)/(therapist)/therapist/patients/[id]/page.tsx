import { PatientDetailClient } from "@/app/(institutes)/(psy_institute)/(therapist)/_components/patients";

type Props = { params: Promise<{ id: string }> };

export default async function TherapistPatientDetailPage({ params }: Props) {
  const { id } = await params;
  return <PatientDetailClient id={Number(id)} />;
}
