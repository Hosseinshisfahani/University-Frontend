"use client";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { LuUniversity } from "react-icons/lu";

const PANEL_CLASS =
  "hero-panel-in hero-panel flex flex-wrap p-4 sm:p-5 gap-y-1 items-start content-start bg-[#0d0d0d] border border-primary/35 rounded-2xl shadow-2xl w-full";

const LINK_CLASS =
  "hero-panel-link bg-primary p-3.5 sm:p-4 text-black w-full block text-center text-sm sm:text-base font-medium rounded-xl shadow-md hover:brightness-105 transition-all min-h-[44px] flex items-center justify-center";

export type HeroMenuLink = { href: string; label: string };

export type HeroMenuProps = {
  id: number;
  openId: number;
  setOpenId: (id: number) => void;
  label: string;
  buttonClassName: string;
  panelTitle: string;
  links: HeroMenuLink[];
};

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getCanHover() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function getServerCanHover() {
  return false;
}

function useCanHover() {
  return useSyncExternalStore(subscribe, getCanHover, getServerCanHover);
}

export default function HeroMenu({
  id,
  openId,
  setOpenId,
  label,
  buttonClassName,
  panelTitle,
  links,
}: HeroMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const canHover = useCanHover();
  const isOpen = openId === id;
  const isTouchMenu = isOpen && !canHover;

  useEffect(() => {
    if (!isOpen || canHover) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenId(0);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [canHover, isOpen, setOpenId]);

  useEffect(() => {
    if (!isTouchMenu) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isTouchMenu]);

  const open = () => setOpenId(id);
  const close = () => setOpenId(0);
  const toggle = () => setOpenId(isOpen ? 0 : id);

  return (
    <>
      {isTouchMenu && (
        <div
          className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={close}
          aria-hidden
        />
      )}

      <div
        ref={menuRef}
        className="relative flex w-full justify-center sm:block sm:w-fit"
        onMouseEnter={canHover ? open : undefined}
        onMouseLeave={canHover ? close : undefined}
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={canHover ? undefined : toggle}
          className={
            buttonClassName +
            (isOpen && !canHover ? " ring-2 ring-primary ring-offset-2 ring-offset-transparent" : "")
          }
        >
          {label}
        </button>

        {isOpen && (
          <div
            className="
              z-[70] w-full
              max-lg:fixed max-lg:right-0 max-lg:bottom-6 max-lg:top-auto max-lg:max-h-[min(70vh,520px)] max-lg:overflow-y-auto
              lg:absolute lg:inset-x-auto lg:bottom-auto lg:overflow-visible lg:max-h-none
              lg:left-full lg:top-1/2 lg:-translate-y-1/2 lg:pl-2 lg:w-[480px]
            "
            onMouseEnter={canHover ? open : undefined}
            onMouseLeave={canHover ? close : undefined}
          >
            <ul className={PANEL_CLASS}>
              <li className="rtl basis-full list-none pb-3 sm:pb-4 mb-2 flex flex-nowrap justify-between items-center gap-3 border-b border-primary/25">
                <h4 className="text-lg sm:text-2xl font-bold text-primary leading-tight">
                  {panelTitle}
                </h4>
                <span className="flex shrink-0 items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/15 text-primary">
                  <LuUniversity size={20} />
                </span>
              </li>
              {links.map((link, index) => (
                <li
                  key={link.label}
                  className="p-1 sm:p-1.5 basis-full sm:basis-1/2 hero-item-in list-none"
                  style={{ animationDelay: `${(index + 1) * 0.08}s` }}
                >
                  <Link className={LINK_CLASS} href={link.href} onClick={close}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
