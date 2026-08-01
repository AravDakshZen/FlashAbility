import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <Spinner className="size-6" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
