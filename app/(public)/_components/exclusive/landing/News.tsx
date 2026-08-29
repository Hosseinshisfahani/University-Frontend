import Image from "next/image";
import Content from "../../layout/Content";
import Link from "next/link";
import Carousel from "../../shared/Carousel";
import { listNews } from "@/features/news/api";

export default async function News() {
  const newsItems = await listNews();

  return (
    <Content>
      <h2 className="text-3xl font-bold lg:text-5xl pt-10 text-center gradient-text title">
        «اخبار و اطلاعات»
      </h2>
      <Carousel
        slideClassName="basis-full p-4 min-w-full"
        maxIndex={6}
        slides={newsItems.map((item, idx) => (
          <div key={idx} className="flex flex-wrap relative items-start content-start">
            <div className="basis-full md:basis-2/5 py-1 px-5">
              <Image
                src={item.image}
                className="rounded-xl w-full"
                alt={item.title}
                width={400}
                height={400}
              />
            </div>
            <div className="basis-full md:basis-3/5 py-2 px-5 flex flex-col gap-4">
              <h3 className="text-right text-black dark:text-white font-extrabold text-2xl lg:text-2xl leading-[156%] tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="text-[#333333] font-medium text-lg lg:text-md leading-[156%] tracking-[-0.02em] dark:text-gray-300">
                {item.body}
              </p>
            </div>
            <div className="rounded-full w-full text-center py-6 md:text-left p-2">
              <Link
                href={item.href}
                className="rounded-full text-center bg-black text-primary dark:bg-primary dark:text-background py-4 px-20 select-none"
              >
                مشاهده
              </Link>
            </div>
          </div>
        ))}
      />
    </Content>
  );
}
