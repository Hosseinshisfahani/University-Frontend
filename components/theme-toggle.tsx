"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { CiDark, CiLight } from "react-icons/ci";

function subscribe(onStoreChange: () => void) {
  queueMicrotask(onStoreChange);
  return () => {};
}

function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const isMounted = useIsMounted();
  const activeTheme = resolvedTheme ?? theme;

  return (
    <button
      type="button"
      aria-label="تغییر پوسته روشن و تاریک"
      onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}
      className={
        "p-2 rounded-lg border border-foreground/20 cursor-pointer transition-colors hover:bg-foreground/10 select-none " +
        className
      }
    >
      {isMounted ? (
        activeTheme === "dark" ? (
          <CiLight />
        ) : (
          <CiDark />
        )
      ) : (
        <span className="block h-4 w-4" />
      )}
    </button>
  );
}
