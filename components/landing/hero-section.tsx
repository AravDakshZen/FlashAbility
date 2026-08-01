import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HeroIllustration } from "@/components/landing/hero-illustration";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-gradient-to-b from-primary/5 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28 sm:pb-20 lg:px-8">
        <Reveal>
          <Badge variant="secondary" className="mb-6">
            {siteConfig.name}
          </Badge>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {siteConfig.tagline}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            {siteConfig.description}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className={cn(buttonVariants({ size: "lg" }), "px-6")}
            >
              Start Learning <ArrowRight />
            </Link>
            <Link
              href="/#features"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "px-6"
              )}
            >
              Learn More
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="mt-16 w-full">
          <HeroIllustration />
        </Reveal>
      </div>
    </section>
  );
}
