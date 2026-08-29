import Image from "next/image";
import Link from "next/link";
import Content from "../../layout/Content";
import { universitySections } from "@/app/_data/landing";

export default function Intro() {
  return (
    <Content id="intro">
      <h2 className="text-3xl font-bold lg:text-5xl py-2 lg:py-10 text-center gradient-text title">
        «بخش‌های دانشگاه»
      </h2>

      <svg
        className="w-full mx-auto h-auto lg:w-3/4 lg:h-2"
        height="4"
        viewBox="0 0 1296 4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 4C21.6 4.26667 43.2 4.52 64.8 4.76C259.2 6.92 453.6 8 648 8C842.4 8 1036.8 6.92 1231.2 4.76C1252.8 4.52 1274.4 4.26667 1296 4C1274.4 3.73333 1252.8 3.48 1231.2 3.24C1036.8 1.08 842.4 0 648 0C453.6 0 259.2 1.08 64.8 3.24C43.2 3.48 21.6 3.73333 0 4Z"
          fill="#806C40"
        />
      </svg>

      <div className="px-4 lg:px-10 pt-16 pb-8 lg:pt-24 lg:pb-15 w-full mb-10">        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
          {universitySections.map((section) => (
            <Link
              key={section.slug}
              href={`/university/${section.slug}`}
              title={section.description}
              className="group relative block aspect-[16/9] overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <Image
                src={section.src}
                alt={section.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="z-0 object-cover brightness-[0.90] transition-all duration-700 group-hover:scale-105 group-hover:brightness-100"/>
              <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl border-[2px] border-[#806C40]/60 dark:border-[#D4AF37]/50 shadow-[inset_0_0_24px_rgba(0,0,0,0.45)] transition-colors duration-300 group-hover:border-[#806C40] dark:group-hover:border-[#D4AF37]" />
            </Link>
          ))}
        </div>
      </div>
    </Content>
  );
}