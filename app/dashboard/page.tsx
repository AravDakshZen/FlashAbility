import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/supabase/dal";
import { logout } from "@/services/auth-service";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BookOpen } from "lucide-react";

/**
 * Minimal protected landing point after sign-in. Course decks will live here.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-start px-4 py-16 sm:px-6 lg:px-8">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Signed in
            </Badge>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Your course library is coming soon. In the meantime, try a sample
              deck built for every learner.
            </p>
            <Link
              href="/learn"
              className={cn(buttonVariants({ size: "lg" }), "w-full gap-2")}
            >
              <BookOpen className="size-4" aria-hidden="true" />
              Start Learning
            </Link>
            <form action={logout}>
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
