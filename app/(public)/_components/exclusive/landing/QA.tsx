"use client";
import { FaArrowLeft } from "react-icons/fa";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

export default function QA({ question }: { question: string }) {
  return (
    <Disclosure
      as="li"
      className="text-lg text-zinc-600 border-b border-zinc-600 dark:text-zinc-300 dark:border-zinc-700 px-4 lg:px-10 py-5"
    >
      <DisclosureButton className="px-2 lg:px-10 py-5 flex flex-nowrap justify-between text-right items-center content-center gap-4 lg:gap-0 select-none cursor-pointer w-full">
        <h4 className="text-lg lg:text-2xl font-bold">❖ {question}</h4>
        <FaArrowLeft className="shrink-0" />
      </DisclosureButton>
      <DisclosurePanel className="w-full p-6 rounded text-zinc-700 bg-slate-200 dark:text-zinc-200 dark:bg-zinc-800">
        .....
      </DisclosurePanel>
    </Disclosure>
  );
}
