import Link from "next/link";

import { BrandLogo } from "@/components/brandLogo";

const footerColumns = [
  {
    title: "Clothing",
    links: [
      { label: "Latest Drip", href: "/products" },
      { label: "Oversized Shirts", href: "/products" },
      { label: "Hoodies", href: "/products" },
      { label: "Sweatshirts", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "#contact" },
      { label: "Terms", href: "#terms" },
      { label: "FAQ", href: "#faq" },
      { label: "Track Order",href: "/orderStatus"}
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Instagram", href: "#" },
      { label: "X", href: "#" },
      { label: "Email Us", href: "mailto:hello@zinna.com" },
    ],
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_2fr]">
        <div className="max-w-sm">
          <BrandLogo className="text-white" />

          <p className="mt-6 max-w-xs text-sm leading-6 text-white/65">
            Zinna blends modern streetwear with everyday comfort. Designed to
            move with you and built to last.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-medium uppercase tracking-[0.16em]">
                {column.title}
              </h2>

              <nav className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-fit text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl border-t border-white/15 pt-6 text-center text-xs uppercase tracking-[0.12em] text-white/50">
        © {currentYear} Zinna. All rights reserved.
      </div>
    </footer>
  );
}