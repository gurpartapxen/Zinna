import { CircleUserRound, Star } from "lucide-react";

type Review = {
    name: string;
    quote: string;
    rating: number;
};

const reviews: Review[] = [
    {
        name: "Noah Bennett",
        quote: "The fit is relaxed without looking oversized. Easily my new go-to.",
        rating: 5,
    },
    {
        name: "Olivia Hughes",
        quote: "The quality feels premium and the fabric is incredibly comfortable.",
        rating: 5,
    },
    {
        name: "Lucas Reed",
        quote: "Minimal, stylish, and easy to wear with almost everything.",
        rating: 4,
    },
    {
        name: "James Collins",
        quote: "The detailing and finish make it feel like a high-end brand.",
        rating: 4,
    },
    {
        name: "Henry Adams",
        quote: "The sweatshirt is soft, warm, and still feels lightweight.",
        rating: 5,
    },
    {
        name: "Alexander Scott",
        quote: "Great fabric quality and perfect for everyday wear.",
        rating: 4,
    },
    {
        name: "Mason Carter",
        quote: "The design is simple, versatile, and genuinely comfortable.",
        rating: 5,
    },
];

const secondReviews: Review[] = [
    {
        name: "Daniel Brooks",
        quote: "The material feels amazing and holds its shape really well.",
        rating: 5,
    },
    {
        name: "Sophie Morgan",
        quote: "The colors look even better in person. I love the relaxed fit.",
        rating: 5,
    },
    {
        name: "Ethan Parker",
        quote: "Comfortable enough for all day wear while still looking polished.",
        rating: 4,
    },
    {
        name: "Ava Mitchell",
        quote: "The packaging, quality, and details all felt thoughtfully designed.",
        rating: 5,
    },
    {
        name: "Leo Anderson",
        quote: "I ordered one piece and immediately came back for another.",
        rating: 5,
    },
    {
        name: "Mia Thompson",
        quote: "The oversized silhouette is flattering and easy to style.",
        rating: 4,
    },
    {
        name: "William Turner",
        quote: "Great everyday pieces with a unique design language.",
        rating: 5,
    },
];

function ReviewCard({ review }: { review: Review }) {
    return (
        <article className="flex h-64 w-[18rem] shrink-0 flex-col justify-between bg-muted/50 p-6 sm:w-[15rem]">
            <p className="text-base leading-7 text-foreground">
                “{review.quote}”
            </p>

            <div className="flex items-end justify-between gap-4">
                <div>
                    <div className="mb-3 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => {
                            const isFilled = index < review.rating;

                            return (
                                <Star
                                    key={index}
                                    className={
                                        isFilled
                                            ? "size-4 fill-[#f4b740] text-[#f4b740]"
                                            : "size-4 text-muted-foreground/30"
                                    }
                                />
                            );
                        })}
                    </div>

                    <p className="text-sm font-medium">{review.name}</p>
                </div>

                <CircleUserRound
                    aria-hidden="true"
                    className="size-12 shrink-0 text-muted-foreground"
                    strokeWidth={1.4}
                />
            </div>
        </article>
    );
}

function ReviewTape({
    direction,
    reviews: tapeReviews,
}: {
    direction: "left" | "right";
    reviews: Review[];
}) {
    const tapeClassName =
        direction === "right"
            ? "testimonialTape testimonialTapeRight"
            : "testimonialTape testimonialTapeLeft";

    return (
        <div className="w-full overflow-hidden">
            <div className={tapeClassName}>
                <div className="flex shrink-0 gap-4">
                    {tapeReviews.map((review) => (
                        <ReviewCard
                            key={`${direction}-${review.name}`}
                            review={review}
                        />
                    ))}
                </div>

                <div
                    aria-hidden="true"
                    className="flex shrink-0 gap-4"
                >
                    {tapeReviews.map((review) => (
                        <ReviewCard
                            key={`${direction}-duplicate-${review.name}`}
                            review={review}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function TestimonialsSection() {
    return (
        <section className="overflow-hidden bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    What people say
                </p>

                <h2 className="mt-5 font-[family-name:var(--font-arizonia)] text-5xl font-normal leading-9 sm:text-5xl">
                    Loved by the Zinna community
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Real thoughts from people who wear Zinna every day.
                </p>
            </div>

            <div className="space-y-4">
                <ReviewTape direction="right" reviews={reviews} />
                <ReviewTape direction="left" reviews={secondReviews} />
            </div>
        </section>
    );
}