"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";

type SmoothScrollProps = {
  children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <>
      <ReactLenis
        root
        options={{
          autoRaf: true,
          lerp: 0.1,
          smoothWheel: true,
          wheelMultiplier: 0.6,
          anchors: true,
          stopInertiaOnNavigate: true,
        }}
      />

      {children}
    </>
  );
}