import { SlideButton } from "@/components/slideButton";
import { DripCard } from "@/components/dripCard";

const latestDripItems = [
    {
        title: "Abstract Brushstroke Shirt",
        imageSrc: "/images/abstractBrushstroke.jpg",
        imageAlt: "Cream shirt with abstract brushstroke design",
        price: "$89",
        originalPrice: "$119",
    },
    {
        title: "Blue Watercolor Shirt",
        imageSrc: "/images/blueWatercolor.jpg",
        imageAlt: "Cream shirt with blue watercolor design",
        price: "$92",
        originalPrice: "$125",
    },
    {
        title: "Minimalist Colorblock Shirt",
        imageSrc: "/images/minimalistColorblock.jpg",
        imageAlt: "Minimalist navy and cream colorblock shirt",
        price: "$95",
        originalPrice: "$129",
    },
];

export function LatestDripSection() {
    return (
        <section id="latestDrip" className="relative z-20 mt-0 bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-12 flex items-end justify-between gap-6">
                    <h2 className="font-[family-name:var(--font-arizonia)] text-4xl font-normal leading-none sm:text-4xl">
                        Latest Drip
                    </h2>

                    <SlideButton href="/products" className="border-foreground">
                        View all
                    </SlideButton>
                </div>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {latestDripItems.map((item, index) => (
                        <DripCard
                            key={item.title}
                            title={item.title}
                            imageSrc={item.imageSrc}
                            imageAlt={item.imageAlt}
                            price={item.price}
                            originalPrice={item.originalPrice}
                            priority={index === 0}
                            href="/products"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}