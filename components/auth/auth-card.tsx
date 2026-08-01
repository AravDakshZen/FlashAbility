import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Shared shell for the authentication cards (login, signup, password flows). */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card className="gap-6 shadow-sm">
      <CardHeader className="gap-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <CardDescription className="text-pretty">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
      {footer && (
        <CardFooter className="justify-center text-center">{footer}</CardFooter>
      )}
    </Card>
  );
}
