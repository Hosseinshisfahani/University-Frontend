import Image from "next/image";
import Link from "next/link";
import Content from "../../layout/Content";
import { activityCards } from "@/app/_data/landing";

export default function Activity() {
  return (
    <Content id="student">
      <h2 className="text-3xl font-bold lg:text-5xl py-6 lg:py-10 text-center gradient-text title">
        «خدمات دانشجویی»
      </h2>
      <div className="grid grid-cols-1 gap-6 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-10 lg:pb-20">
        {activityCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
          >
            <Image
              src={card.src}
              alt={card.label}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="z-0 object-cover scale-110 brightness-60 transition-all duration-700 group-hover:scale-110 group-hover:brightness-125"
            />
            <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute bottom-4 right-4 z-10 select- rounded-xl bg-background/90 px-5 py-2 text-sm font-bold text-foreground shadow-lg backdrop-blur-md lg:text-base">
              {card.label}
            </div>
          </Link>
        ))}
      </div>

    </Content>
  );
}