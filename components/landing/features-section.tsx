import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/lib/landing-content";

export function FeaturesSection() {
  return (
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
  );
}
