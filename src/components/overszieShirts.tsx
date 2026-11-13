import { SlideButton } from "./slideButton";
import { DripCard } from "@/components/dripCard";

const oversizedShirts = [
    {
        title: "Black Waffle Hoodie",
        imageSrc: "/images/blacWaffle.jpg",
        imageAlt: "Black oversized waffle hoodie",
        price: "$89",
        originalPrice: "$119",
    },
    {
        title: "Blue Cotton Sweater",
        imageSrc: "/images/blueSweater.jpg",
        imageAlt: "Blue oversized cotton sweater",
        price: "$84",
        originalPrice: "$109",
    },
    {
        title: "Green Cotton Sweater",
        imageSrc: "/images/greenSweater.jpg",
        imageAlt: "Green oversized cotton sweater",
        price: "$84",
        originalPrice: "$109",
    },
    {
        title: "Grey Waffle Hoodie",
        imageSrc: "/images/greyWaffle.jpg",
        imageAlt: "Grey oversized waffle hoodie",
        price: "$89",
        originalPrice: "$119",
    },
    {
        title: "Navy Waffle Hoodie",
        imageSrc: "/images/navyWaffle.jpg",
        imageAlt: "Navy oversized waffle hoodie",
        price: "$89",
        originalPrice: "$119",
    },
    {
        title: "White Cotton Sweater",
        imageSrc: "/images/whiteSweater.jpg",
        imageAlt: "White oversized cotton sweater",
        price: "$84",
        originalPrice: "$109",
    },
];

export function OversizedShirts() {
    return (
        <section id="oversizedShirts" className="relative overflow-visible bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto grid max-w-7xl items-start gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-30">
                <div className="lg:sticky lg:top-30">
                    <p className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground">
                        Made for movement
                    </p>

                    <h2 className="mt-5 font-[family-name:var(--font-arizonia)] text-5xl font-normal leading-none tracking-[0.9] sm:text-7xl">
                        Oversized Threads
                    </h2>

                    <p className="mt-7 max-w-md text-sm leading-7 tracking-[0.4] text-muted-foreground sm:text-base">
                        Relaxed silhouettes made from soft cotton fabric. Designed for
                        everyday comfort, effortless layering, and a confident oversized
                        fit.
                    </p>

                    <SlideButton className="mt-6" href="/products">
                        Explore collection
                    </SlideButton>
                </div>

                <div className="mx-auto w-full max-w-[36rem] space-y-5 lg:mx-0">
                    {oversizedShirts.map((shirt, index) => (
                        <DripCard
                            key={shirt.title}
                            title={shirt.title}
                            imageSrc={shirt.imageSrc}
                            imageAlt={shirt.imageAlt}
                            price={shirt.price}
                            originalPrice={shirt.originalPrice}
                            href="/products"
                            priority={index === 0}
                            showDetails={false}
                            showHoverDetails
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}