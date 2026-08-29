import { WorkshopCurriculumAdminClient } from "@/app/(institutes)/(psy_institute)/(admin)/_components/workshops";

export default async function AdminWorkshopCurriculumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WorkshopCurriculumAdminClient slug={slug} />;
}
