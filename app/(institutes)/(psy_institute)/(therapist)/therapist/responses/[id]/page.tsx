import { ResponseReviewClient } from "@/app/(institutes)/(psy_institute)/(therapist)/_components/responses";

type Props = { params: Promise<{ id: string }> };

export default async function TherapistResponseDetailPage({ params }: Props) {
  const { id } = await params;
  return <ResponseReviewClient id={Number(id)} />;
}
