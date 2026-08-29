import Image from "next/image";
import Content from "../../layout/Content";
import Link from "next/link";
import Carousel from "../../shared/Carousel";
import { trustees } from "@/app/_data/trustees";

export default function TrusteesBoard() {
  return (
    <Content>
      <h2 className="text-3xl font-bold lg:text-5xl py-4 text-center gradient-text title">
        «هیئت امنای دانشگاه»
      </h2>
      <Carousel
        slideClassName="basis-full min-w-full p-4 lg:basis-1/2 lg:min-w-1/2 xl:basis-1/3 xl:min-w-1/3"
        maxIndex={1}
        maxIndexMobile={3}
        slides={trustees.map((trustee, idx) => (
          <Link key={idx} href={trustee.href} className="flex items-center content-center flex-wrap relative ">
            <div className="basis-full lg:basis-7/12 px-5">
              <Image
                src={trustee.image}
                className="rounded-xl w-full h-auto object-cover aspect-square"                alt={trustee.name}
                width={500}
                height={500}
              />
            </div>
            <div className="basis-full lg:basis-5/12 px-5 py-4 flex flex-wrap content-center items-center ">
              <h4 className="font-bold text-xl">{trustee.name}</h4>
              <h4 className="font-bold text-xl">{trustee.role}</h4>
            </div>
            <div className="static lg:absolute lg:left-[25%] rounded-full bg-background dark:bg-zinc-800 bottom-[-55px] p-2">
              <button className="rounded-full text-center bg-black text-primary dark:bg-primary dark:text-background py-4 px-10 select-none">
                مشاهده پروفایل
              </button>
            </div>
          </Link>
        ))}
      />
    </Content>
  );
}
