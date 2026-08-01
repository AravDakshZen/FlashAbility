"use client";

import { motion, type Variants } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Clock,
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats } from "@/lib/data/dashboard";
import { useAccessibility } from "@/providers/accessibility-provider";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  delta,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  helper: string;
  delta?: number;
}) {
  const { settings } = useAccessibility();
  const reduced = settings.reduceMotion;
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div variants={item} whileHover={reduced ? undefined : { y: -3 }}>
      <Card className="h-full">
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <Icon className="size-4.5" aria-hidden="true" />
            </span>
            {delta !== undefined && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${
                  positive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {positive ? (
                  <TrendingUp className="size-3.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                )}
                {positive ? "+" : ""}
                {delta}%
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-3xl font-semibold tracking-tight tabular-nums">
              {value}
            </span>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{helper}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/** Responsive statistics grid with staggered entrance animation. */
export function StatsGrid() {
  const { settings } = useAccessibility();
  const reduced = settings.reduceMotion;

  const stats = [
    {
      icon: GraduationCap,
      label: "Courses Completed",
      value: String(dashboardStats.coursesCompleted),
      helper: "2 more than last month",
      delta: 8,
    },
    {
      icon: BookOpen,
      label: "Courses In Progress",
      value: String(dashboardStats.coursesInProgress),
      helper: "Next up: Pronunciation Practice",
    },
    {
      icon: Clock,
      label: "Learning Hours",
      value: String(dashboardStats.learningHours),
      helper: "6h 30m this week",
      delta: 12,
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: `${dashboardStats.streak} days`,
      helper: "Keep it going today!",
      delta: 3,
    },
    {
      icon: Target,
      label: "Overall Completion",
      value: `${dashboardStats.overallCompletion}%`,
      helper: "Across all enrolled courses",
      delta: 5,
    },
  ];

  return (
    <motion.div
      variants={container}
      initial={reduced ? false : "hidden"}
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </motion.div>
  );
}
