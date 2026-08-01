import { getDisplayName } from "@/lib/user";
import type { SessionUser } from "@/types/auth";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

/** Time-based greeting shown at the top of the dashboard. */
export function Greeting({ user }: { user: SessionUser }) {
  return (
    <section aria-label="Greeting" className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {getGreeting()},{" "}
        <span className="text-muted-foreground">{getDisplayName(user)}</span>
      </h1>
      <p className="text-sm text-muted-foreground sm:text-base">
        Continue building your communication skills today.
      </p>
    </section>
  );
}
