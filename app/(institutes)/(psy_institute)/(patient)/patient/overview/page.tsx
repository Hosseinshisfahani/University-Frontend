import Link from "next/link";

export default function PatientOverviewPage() {
  const cards = [
    { href: "/patient/wallet", title: "کیف پول", desc: "موجودی، شارژ و گردش حساب" },
    { href: "/patient/appointments/book", title: "رزرو نوبت", desc: "انتخاب درمانگر و زمان" },
    { href: "/patient/appointments", title: "نوبت‌های من", desc: "نوبت‌های آینده و گذشته" },
    { href: "/patient/notes", title: "یادداشت‌ها", desc: "یادداشت‌های اشتراک‌گذاری‌شده درمانگر" },
    { href: "/patient/tests", title: "آزمون‌ها", desc: "پرسشنامه‌های روان‌سنجی" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="title gradient-text text-3xl font-extrabold">نمای کلی</h1>
        <p className="mt-2 text-sm text-foreground/60">
          از اینجا به کیف پول، نوبت‌ها و آزمون‌های خود دسترسی دارید.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-primary/20 bg-white/70 p-5 transition hover:-translate-y-0.5 hover:border-primary/40 dark:bg-[#121212]/80"
          >
            <h2 className="text-lg font-bold">{card.title}</h2>
            <p className="mt-2 text-sm text-foreground/60">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
