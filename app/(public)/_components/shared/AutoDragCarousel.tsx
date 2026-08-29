"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { ReactNode } from "react";
import "swiper/css";

type AutoDragCarouselProps = {
  slides: ReactNode[];
  slideClassName: string;
  intervalMs?: number;
};

export default function AutoDragCarousel({
  slides,
  slideClassName,
  intervalMs = 3000,
}: AutoDragCarouselProps) {
  return (
    <Swiper
      modules={[Autoplay]}
      dir="rtl"
      slidesPerView="auto"
      slidesPerGroup={1}
      spaceBetween={0}
      loop={slides.length > 1}
      speed={500}
      grabCursor
      autoplay={{
        delay: intervalMs,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      className="w-full select-none"
    >
      {slides.map((slide, idx) => (
        <SwiperSlide key={idx} className={slideClassName}>
          {slide}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
