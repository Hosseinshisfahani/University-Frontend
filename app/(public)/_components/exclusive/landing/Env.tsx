import Image from "next/image";
import Content from "../../layout/Content";
import Link from "next/link";
import { galleryImages } from "@/app/_data/landing";

export default function Env() {
  return (
    <Content id="university">
      <h2 className="title text-center font-bold py-6 lg:py-10 text-3xl lg:text-5xl lg:leading-[156%] gradient-text">
        «فضای دانشگاه
        <br />
        معارف قرآن و عترت»
      </h2>
      <div className="flex flex-wrap justify-center py-10 items-center">
        {galleryImages.map((image, idx) => (
          <div
            key={idx}
            className={`basis-full ${image.basis} h-64 md:h-80 lg:h-96 p-2`}
            >
            <div className="group relative w-full h-full overflow-hidden rounded-xl shadow-sm">
              <Image
                src={image.src}
                alt="Gallery"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover brightness-[0.70] transition-all duration-700 group-hover:scale-105 group-hover:brightness-100"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="py-10 text-center">
        <Link
          href="/gallery"
          className="inline-block bg-black text-primary dark:bg-primary dark:text-background px-15 text-xl py-5 rounded-full transition-transform duration-300 hover:scale-105 select-none"
        >
          ورود به گالری
        </Link>
      </div>
    </Content>
  );
}