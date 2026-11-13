import Image from "next/image";
import { SlideButton } from "@/components/slideButton";

const sweatshirtItems = [
    {
        title: "Olive Green",
        imageSrc: "/images/oliveSweatShirt.jpg",
        imageAlt: "Oversized olive sweatshirt",
        price: "$89",
        backgroundColor: "#87916b",
        textClassName: "text-white",
    },
    {
        title: "Peach",
        imageSrc: "/images/rustSweatShirt.jpg",
        imageAlt: "Oversized rust sweatshirt",
        price: "$89",
        backgroundColor: "#b86c51",
        textClassName: "text-white",
    },
    {
        title: "Rust",
        imageSrc: "/images/peachSweatShirt.jpg",
        imageAlt: "Oversized peach sweatshirt",
        price: "$85",
        backgroundColor: "#efbea9",
        textClassName: "text-black",
    },
    {
        title: "Lavender",
        imageSrc: "/images/lavenderSweatShirt.jpg",
        imageAlt: "Oversized lavender sweatshirt",
        price: "$85",
        backgroundColor: "#bfb4d2",
        textClassName: "text-black",
    },
];

export function SweatshirtsSection() {
    return (
        <section id="sweatshirts" className="bg-background mt-5 px-4 py-24 sm:px-6 sm:py-20 lg:px-8 lg:pb-1">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto text-center mb-16 max-w-2xl">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                        Sweatshirts
                    </p>

                    <h2 className="mt-5 max-w-3xl font-[family-name:var(--font-arizonia)] text-5xl font-normal leading-[0.9] sm:text-7xl">
                        Designed for comfort
                    </h2>
                </div>

                <div className="relative">
                    {sweatshirtItems.map((item, index) => (
                        <article
                            key={item.title}
                            className="sticky top-20 mb-2 min-h-[34rem] overflow-hidden rounded-2xl shadow-xl transition-transform duration-500 lg:top-20 lg:min-h-[38rem]"
                            style={{
                                backgroundColor: item.backgroundColor,
                                zIndex: index + 1,
                            }}
                        >
                            <div
                                className={`group grid min-h-[20rem] grid-cols-1 lg:min-h-[20rem] lg:grid-cols-2 ${item.textClassName}`}
                            >
                                <div className="relative min-h-[15rem] overflow-hidden lg:min-h-full">
                                    <Image
                                        src={item.imageSrc}
                                        alt={item.imageAlt}
                                        fill
                                        priority={index === 0}
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        className="object-contain object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                    />
                                </div>

                                <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-39">
                                    <p className="text-xs font-medium uppercase tracking-[0.25em] opacity-60">
                                        Sweatshirts
                                    </p>

                                    <h3 className="mt-5 max-w-md text-3xl font-[family-name:var(--font-arizonia)] leading-tight sm:text-4xl lg:text-5xl">
                                        {item.title}
                                    </h3>

                                    <p className="mt-2 text-2xl font-medium">{item.price}</p>

                                    <SlideButton
                                        href="/products"
                                        className="mt-10 bg-black text-white hover:bg-white hover:text-black"
                                    >
                                        Shop sweatshirt
                                    </SlideButton>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section >
    );
}