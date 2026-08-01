import Link from "next/link";
import { Settings, LifeBuoy, Mail, Keyboard, MessageCircleQuestion } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/** Settings summary section (profile + preferences links). */
export function SettingsSection() {
  return (
    <Card id="settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="size-4" aria-hidden="true" />
          Settings
        </CardTitle>
        <CardDescription>
          Manage your account, preferences, and accessibility options.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard#accessibility"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <Keyboard className="size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Accessibility</span>
              <span className="text-xs text-muted-foreground">
                Font size, contrast, motion, captions
              </span>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <Mail className="size-4.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Notifications</span>
              <span className="text-xs text-muted-foreground">
                Email and in-app reminders
              </span>
            </div>
          </Link>
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">
          Account settings like name and password are managed through your sign-in
          provider.
        </p>
      </CardContent>
    </Card>
  );
}

/** Help section with quick answers. */
export function HelpSection() {
  return (
    <Card id="help">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="size-4" aria-hidden="true" />
          Help
        </CardTitle>
        <CardDescription>
          Quick answers to common questions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-3">
          {[
            {
              q: "How do I start a course?",
              a: "Open Courses from the sidebar, pick any course, and press Start. Lessons unlock in order as you complete each one.",
            },
            {
              q: "How are points and stars earned?",
              a: "You earn stars by completing lessons with a good score and points for every lesson you finish. Badges unlock at milestones.",
            },
            {
              q: "Can I use the app offline?",
              a: "Yes — download a deck and keep practising without an internet connection. Progress syncs when you are back online.",
            },
          ].map((item) => (
            <li key={item.q} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                <MessageCircleQuestion className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {item.q}
              </span>
              <p className="text-sm text-muted-foreground">{item.a}</p>
            </li>
          ))}
        </ul>
        <Separator />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Need more help? Contact our support team.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" render={<Link href="/#contact" />}>
              Contact support
            </Button>
            <Button variant="ghost" size="sm" render={<Link href="/" />}>
              Visit homepage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
