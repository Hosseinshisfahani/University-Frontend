"use client";
import { FaArrowUp } from "react-icons/fa";

export default function GoToTop() {
  function goBackToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  return (
    <button
      onClick={goBackToTop}
      className="rounded-full flex flex-nowrap justify-center items-center content-center w-16 h-16 bg-white text-black select-none"
    >
      <FaArrowUp size={30} />
    </button>
  );
}
