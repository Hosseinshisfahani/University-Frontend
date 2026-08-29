import Image from "next/image";
import Content from "../../layout/Content";
import AutoDragCarousel from "../../shared/AutoDragCarousel";
import { listThinkTanks } from "@/features/think-tanks/api";
import Link from "next/link";

export default async function ThinkTank() {
  const thinkTankLogos = await listThinkTanks();

  return (
    <Content id="think-tanks">
      <h2 className="text-3xl font-bold lg:text-5xl py-2 lg:py-10 text-center gradient-text title">
        «اندیشکدگان»
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
      <div className="px-4 lg:px-10 py-2 lg:py-15 w-full mb-10">
        <AutoDragCarousel
          slideClassName="!w-1/2 lg:!w-1/4 p-3 lg:p-5"
          intervalMs={1000}
          slides={thinkTankLogos.map((logo) => (
            <Link
              key={logo.slug}
              href={`/think-tanks/${logo.slug}`}
              className="block transition hover:opacity-80"
            >
              <Image
                className="w-full h-auto object-contain"
                alt={logo.alt}
                src={logo.src}
                width={400}
                height={270}
                draggable={false}
              />
            </Link>
          ))}
        />
      </div>
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
    </Content>
  );
}
