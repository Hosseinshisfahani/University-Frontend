import Activity from "@/app/(public)/_components/exclusive/landing/Activity";
import Env from "@/app/(public)/_components/exclusive/landing/Env";
import FAQ from "@/app/(public)/_components/exclusive/landing/FAQ";
import Hero from "@/app/(public)/_components/exclusive/landing/Hero";
import Intro from "@/app/(public)/_components/exclusive/landing/Intro";
import News from "@/app/(public)/_components/exclusive/landing/News";
import ThinkTank from "@/app/(public)/_components/exclusive/landing/ThinkTank";
import TrusteesBoard from "@/app/(public)/_components/exclusive/landing/TrusteesBoard";

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <ThinkTank />
      <Activity />
      <TrusteesBoard />
      <Env />
      <News />
      <FAQ />
    </>
  );
}
