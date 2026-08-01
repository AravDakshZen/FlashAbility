"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, Award, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressValue } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { dashboardStats, weeklyActivity } from "@/lib/data/dashboard";

const MAX_ACTIVITY = Math.max(...weeklyActivity.map((d) => d.minutes));

function WeeklyBars() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="flex h-28 items-end gap-2"
      role="img"
      aria-label={`Weekly activity: ${weeklyActivity
        .map((d) => `${d.day} ${d.minutes} minutes`)
        .join(", ")}`}
    >
      {weeklyActivity.map((day, index) => (
        <div key={day.day} className="flex flex-1 flex-col items-center gap-1.5">
          <motion.div
            initial={reduceMotion ? false : { height: 0 }}
            animate={{ height: `${(day.minutes / MAX_ACTIVITY) * 100}%` }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.5, ease: "easeOut" }}
            className="w-full rounded-md bg-foreground/10 data-highlight:bg-foreground"
            data-highlight={index === weeklyActivity.length - 1 ? "" : undefined}
          />
          <span className="text-[10px] font-medium text-muted-foreground">
            {day.day}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Large progress overview card: overall %, hours, weekly activity, badges. */
export function ProgressOverview() {
  const weeklyTotal = weeklyActivity.reduce((sum, day) => sum + day.minutes, 0);
  const hours = Math.floor(weeklyTotal / 60);
  const minutes = weeklyTotal % 60;

  return (
    <Card id="progress">
      <CardHeader>
        <CardTitle>Progress Overview</CardTitle>
        <CardDescription>
          Your learning at a glance — stay consistent, keep growing.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Overall completion
            </span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {dashboardStats.overallCompletion}%
              </span>
            </div>
            <Progress value={dashboardStats.overallCompletion} className="mt-1">
              <ProgressValue />
            </Progress>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Learning hours
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {dashboardStats.learningHours}
              </span>
              <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Badges earned
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {dashboardStats.badgesEarned}
              </span>
              <Award className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground">
              of {dashboardStats.badgesEarned + 2} available
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Weekly activity
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {hours}h {minutes}m
              </span>
              <TrendingUp className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                +18%
              </Badge>{" "}
              vs last week
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">This week</h3>
            <span className="text-xs text-muted-foreground tabular-nums">
              {weeklyTotal} min total
            </span>
          </div>
          <WeeklyBars />
        </div>
      </CardContent>
    </Card>
  );
}
