import { PatientGuard, PatientShell } from "@/app/(institutes)/(psy_institute)/(patient)/_components/shell";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <PatientGuard>
      <PatientShell>{children}</PatientShell>
    </PatientGuard>
  );
}
