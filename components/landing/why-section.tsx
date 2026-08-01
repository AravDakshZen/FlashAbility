import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { whyCards } from "@/lib/landing-content";

export function WhySection() {
  return (
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
  );
}
