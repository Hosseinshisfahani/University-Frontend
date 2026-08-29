import { PsychometricFormRenderer } from "@/app/(institutes)/(psy_institute)/(patient)/_components/tests";

type Props = { params: Promise<{ slug: string }> };

export default async function TestDetailPage({ params }: Props) {
  const { slug } = await params;
  return <PsychometricFormRenderer slug={slug} />;
}
