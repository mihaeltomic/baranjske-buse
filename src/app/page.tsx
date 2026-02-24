import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import FooterSection from "@/components/FooterSection";
import AmbientAudio from "@/components/AmbientAudio";

export default function Home() {
  return (
    <main style={{ background: "#000" }}>
      <HeroSection />
      <ContentSection />
      <FooterSection />
      <AmbientAudio />
    </main>
  );
}
