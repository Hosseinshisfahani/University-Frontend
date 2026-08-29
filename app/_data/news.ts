export type NewsItem = {
  image: string;
  title: string;
  body: string;
  href: string;
};

const body =
  "نشست تخصصی «معنویت و آینده آموزش» با حضور جمعی از اساتید و پژوهشگران حوزه علوم انسانی اسلامی در دانشگاه معارف قرآن و عترت برگزار شد. در این رویداد، نقش مفاهیم معنوی در شکل‌گیری نظام آموزشی آینده مورد بررسی قرار گرفت.";

export const newsItems: NewsItem[] = Array.from({ length: 8 }, () => ({
  image: "/static/B1.png",
  title: "برگزاری همایش «معنویت و آینده آموزش»",
  body,
  href: "/news/somef",
}));
