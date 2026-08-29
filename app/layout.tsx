import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import QueryProvider from "@/lib/providers/QueryProvider";
import AuthSessionProvider from "@/features/auth/AuthSessionProvider";

const vazirmatn = localFont({
  src: [
    { path: "../public/fonts/Vazirmatn-Regular.ttf", weight: "400" },
    { path: "../public/fonts/Vazirmatn-Medium.ttf", weight: "500" },
    { path: "../public/fonts/Vazirmatn-Bold.ttf", weight: "700" },
    { path: "../public/fonts/Vazirmatn-ExtraBold.ttf", weight: "800" },
  ],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://khunamun-edu.com"),
  title: {
    default: "Etrat University",
    template: "%s | Etrat University",
  },
  description:
    "دانشگاه معارف قرآن و عترت (علیهم‌السلام) اصفهان؛ معرفی دانشگاه، اندیشکده‌ها، دوره‌های آموزشی، اخبار و ارتباط با ما.",
  applicationName: "Etrat University",
  keywords: [
    "دانشگاه معارف قرآن و عترت",
    "دانشگاه عترت اصفهان",
    "علوم قرآن و حدیث",
    "Etrat University",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: "Etrat University",
    title: "Etrat University",
    description: "دانشگاه معارف قرآن و عترت (علیهم‌السلام) اصفهان",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full rtl" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          value={{ light: "light", dark: "dark" }}
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthSessionProvider>{children}</AuthSessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
