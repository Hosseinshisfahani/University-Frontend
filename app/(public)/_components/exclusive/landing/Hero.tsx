"use client";
import Landing from "@/app/page.module.css";

export default function Hero() {
  return (
    <section className={"relative w-full min-h-screen lg:h-screen overflow-hidden " + Landing.hero}>
      
      <div className="absolute top-0 left-0 z-10 w-full h-full flex flex-col justify-center gap-6 sm:gap-8 ltr px-4 sm:px-6 lg:px-30 items-center lg:items-start select-none">
        {/* متن‌ها و المان‌های اصلی بنر اینجا قرار می‌گیرن */}
      </div>

      {/* کادر شناور «تازه‌ها» */}
      <div className="hidden lg:flex flex-col absolute left-10 top-1/2 -translate-y-1/2 z-20 w-[340px] bg-white/60 dark:bg-black/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-[52%]">
        
        {/* هدرِ کادر */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/10">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">تازه‌ها</h3>
        </div>
        
        {/* بدنه و محتوای کادر (اسکلت‌بندی موقت) */}
        <div className="p-6 flex flex-col gap-5">
          {/* جایگاه عکس */}
          <div className="w-full h-36 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
          
          {/* جایگاه متن */}
          <div className="space-y-3">
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-3/4 animate-pulse" />
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-full animate-pulse" />
            <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full w-5/6 animate-pulse" />
          </div>
        </div>

      </div>
    </section>
  );
}