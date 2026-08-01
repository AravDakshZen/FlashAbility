import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  AudioWaveform,
  BadgeCheck,
  Check,
  Contrast,
  ExternalLink,
  Globe,
  Keyboard,
  Languages,
  Leaf,
  Layers,
  Mic,
  MonitorSmartphone,
  Repeat,
  ShieldCheck,
  Smartphone,
  Speech,
  Type,
  Volume2,
  WifiOff,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { HeroIllustration } from "@/components/landing/hero-illustration";
import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Layers,
    title: "Electronic Flashcards",
    description:
      "Digital decks that replace printed cards — instantly searchable, reusable, and easy to update.",
  },
  {
    icon: Repeat,
    title: "Digital Reinforcement Cards",
    description:
      "Built-in positive reinforcement keeps learners motivated through every session.",
  },
  {
    icon: Mic,
    title: "Speech-to-Text",
    description:
      "Learners can speak answers and watch them turn into text in real time.",
  },
  {
    icon: Volume2,
    title: "Text-to-Speech",
    description:
      "Clear, natural voice playback for every word, phrase, and card.",
  },
  {
    icon: Speech,
    title: "Pronunciation Assistance",
    description:
      "Hear correct pronunciation and practice with gentle, instant feedback.",
  },
  {
    icon: WifiOff,
    title: "Offline Learning",
    description:
      "Download decks and keep learning even without an internet connection.",
  },
  {
    icon: Languages,
    title: "Multilingual Support",
    description:
      "Switch between languages to match each learner's comfort and needs.",
  },
  {
    icon: MonitorSmartphone,
    title: "E-paper Compatibility",
    description:
      "Optimized for low-glare e-paper and tablet displays for comfortable reading.",
  },
  {
    icon: Accessibility,
    title: "Accessibility First",
    description:
      "High-contrast UI, keyboard navigation, and screen-reader support built in from day one.",
  },
];

const whyCards = [
  {
    icon: Leaf,
    title: "Reduce Paper Waste",
    description:
      "Cut down on printing, laminating, and replacing worn-out card sets.",
  },
  {
    icon: Smartphone,
    title: "Portable Learning",
    description:
      "Your entire flashcard library travels with you — right in your pocket.",
  },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description:
      "One account, every device: tablets, phones, laptops, and e-paper.",
  },
];

const accessibilityHighlights = [
  {
    icon: Contrast,
    title: "High Contrast Mode",
    description:
      "A high-contrast theme strengthens readability for low-vision users.",
  },
  {
    icon: Keyboard,
    title: "Keyboard Navigation",
    description: "Every feature is reachable and operable with a keyboard alone.",
  },
  {
    icon: AudioWaveform,
    title: "Voice Support",
    description: "Screen-reader friendly labels and voice output for every action.",
  },
  {
    icon: Type,
    title: "Adjustable Font Sizes",
    description: "Text scales to whatever size is most comfortable to read.",
  },
  {
    icon: BadgeCheck,
    title: "Accessibility Guidelines",
    description: "Aligned with government accessibility guidelines (WCAG 2.x AA).",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Hero */}
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
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }), "px-6")}
                >
                  Get Started <ArrowRight />
                </Link>
                <Link
                  href="/#features"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
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

        {/* Features */}
        <section id="features" className="border-t bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-2xl">
                <Badge variant="secondary">Features</Badge>
                <h2 className="font-heading mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Everything you need to learn
                </h2>
                <p className="mt-3 text-pretty text-muted-foreground">
                  Designed for learners, clinicians, and caregivers — with
                  accessibility at the core.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Reveal
                  key={feature.title}
                  className="h-full"
                  delay={(index % 3) * 0.05}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <feature.icon className="size-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="mt-2">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Why e-Flash Cards */}
        <section id="why" className="py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-2xl">
                <Badge variant="secondary">Why e-Flash Cards</Badge>
                <h2 className="font-heading mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Better for learners, better for the planet
                </h2>
                <p className="mt-3 text-pretty text-muted-foreground">
                  A modern alternative to printed flashcards that is lighter,
                  smarter, and always within reach.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {whyCards.map((card, index) => (
                <Reveal key={card.title} className="h-full" delay={index * 0.05}>
                  <Card className="h-full">
                    <CardHeader>
                      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <card.icon className="size-5" aria-hidden="true" />
                      </span>
                      <CardTitle className="mt-2">{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section
          id="accessibility"
          className="border-t bg-muted/40 py-16 sm:py-24"
        >
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <div>
                <Badge variant="secondary">Accessibility</Badge>
                <h2 className="font-heading mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Learning that works for everyone
                </h2>
                <p className="mt-3 text-pretty text-muted-foreground">
                  Every part of e-Flash Cards is built accessibility-first —
                  from color contrast to keyboard flow — so learners of all
                  abilities can practice with confidence.
                </p>
                <ul className="mt-8 space-y-4">
                  {accessibilityHighlights.map((item) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                      <span>
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="block text-sm text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Card className="gap-4 p-6">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-lg font-semibold tracking-tight">
                  Government accessibility guidelines
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our interface follows WCAG 2.x AA — the standard referenced
                  by government accessibility guidelines — covering contrast,
                  keyboard operability, and screen-reader support.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">WCAG 2.x AA</Badge>
                  <Badge variant="secondary">Keyboard first</Badge>
                  <Badge variant="secondary">Screen-reader ready</Badge>
                </div>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* About */}
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

        {/* Contact */}
        <section id="contact" className="border-t bg-muted/40 py-16 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Get in touch
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
                Questions, feedback, or ideas for new decks? We would love to
                hear from you.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }), "px-6")}
                >
                  Start Learning Free
                </Link>
                <Link
                  href={siteConfig.links.github}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "px-6"
                  )}
                >
                  <ExternalLink />
                  Contribute on GitHub
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
