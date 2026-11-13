import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Arizonia, Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { cn } from "@/lib/utils";
import { SmoothScroll } from "@/components/smoothScroll";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const arizonia = Arizonia({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-arizonia",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zinna — Everyday Drip",
    template: "%s | Zinna",
  },
  description:
    "Discover expressive everyday clothing by Zinna — made for comfort, movement, and your own kind of drip.",
  applicationName: "Zinna",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        inter.variable,
        arizonia.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col"><SmoothScroll>{children}</SmoothScroll></body>
    </html>
  );
}
