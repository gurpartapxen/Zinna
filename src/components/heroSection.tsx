import { SlideButton } from "@/components/slideButton";
import { HeroImage } from "@/components/heroImage";
import { RotatingCard } from "@/components/rotatingCard";

export function HeroSection() {
  return (
    <section className="relative z-0 bg-background lg:h-[100svh] lg:overflow-visible">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-start gap-x-4 px-4 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-0 lg:px-8 lg:pt-16">
        {/* Left image rail */}
        <div className="relative z-10 order-2 h-[min(52svh,26rem)] w-[42vw] max-w-[14rem] min-w-0 justify-self-end sm:max-w-[16rem] lg:order-1 lg:h-[calc(100svh+var(--heroStickyRunway))] lg:w-[min(34vw,28rem)] lg:max-w-none">
          <div className="h-full lg:sticky lg:top-[35svh] lg:h-[65svh]">
            <HeroImage
              src="/images/front.png"
              alt="Zinna front hoodie collection"
              priority
              imageClassName="origin-bottom scale-100 lg:scale-100"
            />
          </div>
        </div>

        {/* Normal-flow center content */}
        <div className="order-1 col-span-3 flex flex-col items-center gap-10 pt-5 lg:order-2 lg:col-span-1 lg:gap-10 lg:pt-[3vh]">
          <RotatingCard
            imageSrc="/images/backside.png"
            imageAlt="Zinna hoodie back design"
            priority
          />

          <SlideButton
            href="/products"
            className="h-8 min-w-40 px-2"
          >
            Shop the drip
          </SlideButton>
      </div>

      {/* Right image rail */}
      <div className="relative z-10 order-3 h-[min(52svh,26rem)] w-[42vw] max-w-[14rem] min-w-0 justify-self-start sm:max-w-[16rem] lg:order-3 lg:h-[calc(100svh+var(--heroStickyRunway))] lg:w-[min(30vw,28rem)] lg:max-w-none">
        <div className="h-full lg:sticky lg:top-[35svh] lg:h-[65svh]">
          <HeroImage
            src="/images/sideface.png"
            alt="Zinna side profile hoodie collection"
            imageClassName="origin-bottom scale-100 lg:scale-80"
          />
        </div>
      </div>
    </div>
    </section >
  );
}