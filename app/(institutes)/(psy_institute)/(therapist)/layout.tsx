import { TherapistGuard, TherapistShell } from "@/app/(institutes)/(psy_institute)/(therapist)/_components/shell";

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TherapistGuard>
      <TherapistShell>{children}</TherapistShell>
    </TherapistGuard>
  );
}
