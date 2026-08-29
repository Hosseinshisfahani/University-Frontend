import Link from "next/link";

/** Platform auth shell — no institute CSS or components. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4 sm:px-6">
          <Link href="/" className="title text-lg font-bold text-foreground">
            ورود
          </Link>
          <Link
            href="/"
            className="text-sm text-foreground/60 transition hover:text-foreground"
          >
            بازگشت
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        {children}
      </main>
    </div>
  );
}
