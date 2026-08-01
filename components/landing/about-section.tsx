import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/constants";

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <Badge variant="secondary">About</Badge>
            <h2 className="font-heading mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              About {siteConfig.name}
            </h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 text-pretty text-muted-foreground">
              {siteConfig.description}
            </p>
            <p className="mt-3 text-pretty text-muted-foreground">
              Our mission is simple: make communication learning accessible
              to everyone. Every deck is designed with clear, high-contrast
              visuals, simple navigation, and support for assistive
              technologies — so learners of all abilities can practice with
              confidence.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
