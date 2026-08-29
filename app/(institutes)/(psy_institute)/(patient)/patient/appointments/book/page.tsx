import { Suspense } from "react";
import { BookAppointmentClient } from "@/app/(institutes)/(psy_institute)/(patient)/_components/appointments";

export default function BookAppointmentPage() {
  return (
    <Suspense fallback={<p className="text-foreground/50">در حال بارگذاری…</p>}>
      <BookAppointmentClient />
    </Suspense>
  );
}
