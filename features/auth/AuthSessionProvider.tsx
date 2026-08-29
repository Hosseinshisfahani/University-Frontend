"use client";

import type { ReactNode } from "react";
import { useAuthBootstrap } from "./hooks";

export default function AuthSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  useAuthBootstrap();
  return children;
}
