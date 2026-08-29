import { AdminGuard, AdminShell } from "@/app/(institutes)/(psy_institute)/(admin)/_components/shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
