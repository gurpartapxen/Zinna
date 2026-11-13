"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const dripImages = [
  {
    src: "/images/abstractBrushstroke.jpg",
    alt: "Abstract brushstroke shirt from Zinna",
    title: "Latest Drip",
    className:
      "left-[-4rem] top-[14%] rotate-[-10deg] sm:left-2 lg:left-10",
    hiddenClass: "-translate-x-24",
  },
  {
    src: "/images/gryphonHoodie.jpg",
    alt: "Gryphon hoodie from Zinna",
    title: "Signature Hoodies",
    className:
      "bottom-[3%] right-[-4rem] rotate-[10deg] sm:right-2 lg:right-10",
    hiddenClass: "translate-x-24",
  },
];

export function AboutIntro() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(section);
        }
      },
      {
        threshold: 0.2,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate min-h-[90svh] overflow-hidden bg-background"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      {dripImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute z-10 w-52 transition-all duration-1000 ease-out sm:w-64 lg:w-80 ${
            image.className
          } ${
            isVisible
              ? "translate-x-0 translate-y-0 scale-100 opacity-100"
              : `${image.hiddenClass} translate-y-10 scale-95 opacity-0`
          }`}
          style={{
            transitionDelay: `${index * 100}ms`,
          }}
        >
          <div className="bg-white p-3 pb-5 shadow-2xl sm:p-4 sm:pb-6">
            <div className="relative aspect-[4/5] overflow-hidden bg-muted">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 55vw, (max-width: 1024px) 35vw, 25vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>

            <p className="mt-4 text-center text-xs font-medium uppercase tracking-[0.16em] text-black sm:text-sm">
              {image.title}
            </p>
          </div>
        </div>
      ))}

      <div className="relative z-20 mx-auto flex min-h-[90svh] max-w-3xl items-center justify-center px-8 py-32 text-center">
        <div>
          <p className="mb-6 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            The Zinna point of view
          </p>

          <h1 className="text-5xl font-[family-name:var(--font-arizonia)] leading-[0.7] tracking-[-0.05em] text-foreground sm:text-7xl lg:text-7xl">
            Built for the drip.
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Our pieces are designed to make everyday dressing feel effortless.
            From expressive printed shirts and relaxed oversized fits to
            comfortable hoodies and signature sweatshirts, every Zinna product
            brings together character, comfort, and confidence. We create
            clothing that moves with you, layers easily, and gives your
            personal style room to speak. Whether you are building a full
            outfit or adding one standout piece, Zinna is made to help you feel
            comfortable in your own expression.
          </p>
        </div>
      </div>
      
    </section>
  );
}