import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Spinner className="size-6" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
