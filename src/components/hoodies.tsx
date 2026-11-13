import { DripCard } from "@/components/dripCard";
import { SlideButton } from "@/components/slideButton";

const hoodieItems = [
  {
    title: "Gryphon Graphic Hoodie",
    imageSrc: "/images/gryphonHoodie.jpg",
    imageAlt: "Black oversized gryphon graphic hoodie",
    price: "$99",
    originalPrice: "$129",
  },
  {
    title: "Panda Graphic Hoodie",
    imageSrc: "/images/pandaHoodie.jpg",
    imageAlt: "Black oversized panda graphic hoodie",
    price: "$99",
    originalPrice: "$129",
  },
  {
    title: "Grey Essential Hoodie",
    imageSrc: "/images/greyHoodie.jpg",
    imageAlt: "Grey oversized essential hoodie",
    price: "$89",
    originalPrice: "$119",
  },
];

export function HoodiesSection() {
  return (
    <section id="hoodies" className="relative z-20 mt-0 bg-background px-4 pb-24 pt-12 sm:px-6 sm:pb-32 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2 className="font-[family-name:var(--font-arizonia)] text-5xl font-normal leading-none sm:text-6xl">
            Hoodies
          </h2>

          <SlideButton href="/collections/hoodies">
            View all
          </SlideButton>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {hoodieItems.map((item, index) => (
            <DripCard
              key={item.title}
              title={item.title}
              imageSrc={item.imageSrc}
              imageAlt={item.imageAlt}
              price={item.price}
              originalPrice={item.originalPrice}
              href="/products"
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}