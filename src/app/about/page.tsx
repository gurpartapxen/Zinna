import { AboutIntro } from "@/components/aboutIntro";
import { ComfortBanner } from "@/components/banner";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main>
        <AboutIntro />
        <ComfortBanner />
      </main>

      <Footer />
    </>
  );
}