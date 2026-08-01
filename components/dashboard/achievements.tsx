"use client";

import { motion } from "framer-motion";
import { Check, Lock, Sparkles, Zap, GraduationCap, CalendarCheck, Target } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { achievements } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

const ACHIEVEMENT_ICONS: Record<string, typeof Target> = {
  "first-steps": Sparkles,
  "course-completion": GraduationCap,
  "perfect-score": Target,
  consistency: CalendarCheck,
  "fast-learner": Zap,
  "communication-expert": Target,
};

function AchievementCard({
  achievement,
}: {
  achievement: (typeof achievements)[number];
}) {
  const Icon = ACHIEVEMENT_ICONS[achievement.id] ?? Sparkles;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <div
            className={cn(
              "relative flex cursor-help flex-col items-center gap-3 rounded-xl border p-6 text-center outline-none",
              achievement.unlocked
                ? "border-transparent bg-muted/40 ring-1 ring-foreground/10"
                : "border-dashed border-foreground/15 bg-background opacity-60"
            )}
          >
            <span
              className={cn(
                "relative flex size-12 items-center justify-center rounded-full",
                achievement.unlocked
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {achievement.unlocked && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-foreground/10">
                  <Check className="size-2.5 text-foreground" aria-hidden="true" />
                </span>
              )}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{achievement.name}</span>
              {achievement.earnedAt && (
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        }
      />
      <TooltipContent>
        <p>{achievement.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/** Responsive grid of earned and locked achievements. */
export function Achievements() {
  return (
    <Card id="achievements">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Badges you have earned and the ones waiting for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06, duration: 0.3 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" aria-hidden="true" />
          {achievements.filter((a) => !a.unlocked).length} locked — keep practicing
          to unlock them.
        </p>
      </CardContent>
    </Card>
  );
}
