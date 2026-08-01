import { Check } from "lucide-react";

import { Logo } from "@/components/logo";
import { siteConfig } from "@/lib/constants";

const highlights = [
  "Accessibility-first flashcards",
  "Works offline, anywhere",
  "Multilingual and e-paper ready",
];

/**
 * Shared split layout for all auth pages: branding panel on the left
 * (desktop only), the auth card on the right.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r bg-muted/50 p-10 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -left-32 size-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-32 size-[28rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative">
          <Logo />
        </div>
        <div className="relative max-w-md">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance">
            Empowering Communication Through Digital Learning
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">
            Replace printed flashcards with an accessible, interactive learning
            experience built for Persons with Disabilities, clinicians, and
            caregivers.
          </p>
          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </aside>

      <main className="flex min-h-svh items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
