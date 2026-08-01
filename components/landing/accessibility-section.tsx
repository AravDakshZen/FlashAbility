import { Check, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { accessibilityHighlights } from "@/lib/landing-content";

export function AccessibilitySection() {
  return (
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
  );
}
