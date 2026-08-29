"use client";
import { useEffect, useState, type ReactNode } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

type CarouselProps = {
  slides: ReactNode[];
  slideClassName: string;
  maxIndex: number;
  maxIndexMobile?: number;
};

export default function Carousel({
  slides,
  slideClassName,
  maxIndex,
  maxIndexMobile,
}: CarouselProps) {
  const [carouselIdx, setCarouselIdx] = useState<number>(0);
  const [isDesktop, setIsDesktop] = useState<boolean>(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const activeMax = isDesktop ? maxIndex : maxIndexMobile ?? maxIndex;
  const displayIdx = Math.min(carouselIdx, activeMax + 1);

  function next() {
    if (displayIdx <= activeMax) {
      setCarouselIdx(displayIdx + 1);
    }
  }
  function prev() {
    if (displayIdx > 0) {
      setCarouselIdx(displayIdx - 1);
    }
  }
  return (
    <>
      <div className="flex flex-nowrap items-start content-start justify-start overflow-hidden py-10">
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={slideClassName + " transition"}
            style={{ transform: "translate(" + displayIdx + "00%)" }}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="py-4 flex flex-nowrap justify-between">
        <div className="flex flex-nowrap px-4">
          <button
            onClick={prev}
            className="rounded-full hover:bg-gray-200 active:bg-black cursor-pointer active:text-white bg-gray-100 text-slate-800 dark:bg-zinc-800 dark:text-slate-100 dark:hover:bg-zinc-700 p-4 mx-1 select-none"
          >
            <FaArrowRight />
          </button>
          <button
            onClick={next}
            className="rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer active:bg-black active:text-white text-slate-800 dark:bg-zinc-800 dark:text-slate-100 dark:hover:bg-zinc-700 p-4 mx-1 select-none"
          >
            <FaArrowLeft />
          </button>
        </div>
      </div>
    </>
  );
}
