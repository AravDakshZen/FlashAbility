import type { SessionUser } from "@/types/auth";

/** Best-effort display name from user metadata, falling back to email prefix. */
export function getDisplayName(user: SessionUser): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name) return name;
  return (user.email ?? "there").split("@")[0] ?? "there";
}

/** Up to two initials for avatars. */
export function getInitials(user: SessionUser): string {
  const name = user.user_metadata?.full_name as string | undefined;
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return (user.email ?? "U").slice(0, 2).toUpperCase();
}
