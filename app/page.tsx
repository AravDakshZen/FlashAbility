import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AboutSection } from "@/components/landing/about-section";
import { AccessibilitySection } from "@/components/landing/accessibility-section";
import { ContactSection } from "@/components/landing/contact-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { WhySection } from "@/components/landing/why-section";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WhySection />
        <AccessibilitySection />
        <AboutSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
