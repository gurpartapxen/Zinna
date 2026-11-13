import Image from "next/image";

type RotatingCardProps = {
    imageSrc?: string;
    imageAlt?: string;
    discountValue?: string;
    couponCode?: string;
    priority?: boolean;
};

export function RotatingCard({
    imageSrc,
    imageAlt = "Zinna collection",
    discountValue = "50%",
    couponCode = "ZINNA50",
    priority = false,
}: RotatingCardProps) {
    return (
        <div className="pb-8 [perspective:1200px]">
            <div className="offerCardRotation relative aspect-[4/5] w-[clamp(12rem,30vw,20rem)]">
                {Array.from({ length: 17 }).map((_, index) => (
                    <div
                        key={index}
                        className="absolute inset-0 rounded-sm bg-[#65747a]"
                        style={{
                            transform: `translateZ(${index - 8}px)`,
                        }}
                    />
                ))}
                <div className="absolute inset-0 z-10 overflow-hidden rounded-sm bg-muted shadow-2xl [backface-visibility:hidden] [transform:translateZ(10px)]">
                    {imageSrc ? (
                        <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            priority={priority}
                            sizes="(max-width: 768px) 70vw, 24vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-400">
                            <span className="text-xs uppercase tracking-[0.25em] text-slate-700">
                                Image side
                            </span>
                        </div>
                    )}
                </div>

                <div className="absolute inset-0 z-10 flex flex-col justify-between overflow-hidden rounded-sm bg-[#152631] p-5 text-white shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(10px)] sm:p-7">
                    <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[#e8c98d]">
                            Limited offer
                        </p>

                        <p className="mt-8 text-5xl font-semibold tracking-tight sm:text-6xl">
                            {discountValue}
                        </p>

                        <p className="text-lg uppercase tracking-[0.25em] text-[#e8c98d]">
                            off
                        </p>
                    </div>

                    <div>
                        <p className="text-[0.6rem] uppercase tracking-[0.25em] text-white/60">
                            Use coupon code
                        </p>

                        <p className="mt-2 text-lg font-semibold tracking-[0.15em]">
                            {couponCode}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}