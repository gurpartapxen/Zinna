import { DripCard } from "@/components/dripCard";

const featuredDripItems = [
    {
        title: "Black Dragonfly",
        imageSrc: "/images/blackSweatShirt.jpg",
        imageAlt: "Abstract brushstroke shirt",
        price: "$89",
        originalPrice: "$119",
    },
    {
        title: "Burnt Orange",
        imageSrc: "/images/orangeSweatShirt.jpg",
        imageAlt: "Blue watercolor shirt",
        price: "$92",
        originalPrice: "$125",
    },
    {
        title: "Sky Zinna",
        imageSrc: "/images/skySweatShirt.jpg",
        imageAlt: "Minimalist colorblock shirt",
        price: "$95",
        originalPrice: "$129",
    },
];

export function FeaturedDripSection() {
    return (
        <section className="bg-background px-4 py-1 sm:px-6 sm:py-1 lg:px-8 lg:pt-[0.5] lg:pb-3">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {featuredDripItems.map((item, index) => (
                        <DripCard
                            key={item.title}
                            title={item.title}
                            imageSrc={item.imageSrc}
                            imageAlt={item.imageAlt}
                            price={item.price}
                            originalPrice={item.originalPrice}
                            href="/products"
                            priority={index === 0}
                            showDetails
                            showHoverDetails={false}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}