import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ContactSection() {
  return (
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
              href="/courses"
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
  );
}
