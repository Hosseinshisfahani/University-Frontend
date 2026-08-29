import { TherapistPublicProfile } from "@/app/(institutes)/(psy_institute)/(psy)/_components/therapists";

type Props = { params: Promise<{ id: string }> };

export default async function TherapistProfilePage({ params }: Props) {
  const { id } = await params;
  return <TherapistPublicProfile id={Number(id)} />;
}
