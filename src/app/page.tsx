import { ComfortBanner } from "@/components/banner";
import { FaqSection } from "@/components/faq";
import { FeaturedDripSection } from "@/components/featuredDrip";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/heroSection";
import { HoodiesSection } from "@/components/hoodies";
import { LatestDripSection } from "@/components/latestDrip";
import { Navbar } from "@/components/navbar";
import { OversizedShirts } from "@/components/overszieShirts";
import { NewsletterPopup } from "@/components/popup";
import { StoryBanner } from "@/components/storyBanner";
import { SweatshirtsSection } from "@/components/sweatShirts";
import { TestimonialsSection } from "@/components/testimonials";

export default function Home() {
  return (
    <>
    <NewsletterPopup/>

    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <LatestDripSection />
      <StoryBanner />
      <OversizedShirts />
      <HoodiesSection />
      <ComfortBanner />
      <SweatshirtsSection />
      <FeaturedDripSection />
      <TestimonialsSection />
      <FaqSection />
      <Footer />
    </main>
    </>
  );
}