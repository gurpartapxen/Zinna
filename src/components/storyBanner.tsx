import { SlideButton } from "@/components/slideButton";

type StoryBannerProps = {
    videoSrc?: string;
};

export function StoryBanner({
    videoSrc = "/images/316988_medium.mp4",
}: StoryBannerProps) {
    return (
        <section className="relative isolate h-[60svh] min-h-[26rem] overflow-hidden bg-black text-white sm:h-[65svh] lg:h-[70svh]">
            <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
            >
                <source src={videoSrc} type="video/mp4" />
            </video>

            <div className="absolute inset-0 bg-black/35" />

            <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
                <div className="max-w-2xl">
                    <h2 className="font-[family-name:var(--font-arizonia)] text-4xl font-normal leading-none sm:text-6xl lg:text-6xl">
                        Our Story, Your Style
                    </h2>

                    <p className="mx-auto mt-5 max-w-xl text-sm leading-5 text-white/90 sm:text-base lg:text-lg">
                        Crafting timeless fashion with quality, innovation, and
                        sophistication at the core.
                    </p>

                    <SlideButton
                        href="/about"
                        className="mt-3 bg-white text-black hover:bg-black hover:text-white"
                    >
                        About us
                    </SlideButton>
                </div>
            </div>
        </section>
    );
}