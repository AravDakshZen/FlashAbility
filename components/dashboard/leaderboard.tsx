"use client";

import { motion } from "framer-motion";
import { Star, Award, GraduationCap, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { leaderboard } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

const RANK_STYLES: Record<number, { label: string; className: string }> = {
  1: { label: "1st", className: "bg-foreground text-background" },
  2: { label: "2nd", className: "bg-muted text-foreground ring-1 ring-foreground/20" },
  3: { label: "3rd", className: "bg-muted text-foreground ring-1 ring-foreground/10" },
};

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    const style = RANK_STYLES[rank];
    return (
      <span
        className={cn(
          "inline-flex size-7 items-center justify-center rounded-md text-xs font-semibold tabular-nums",
          style.className
        )}
      >
        {style.label}
      </span>
    );
  }
  return (
    <span className="inline-flex size-7 items-center justify-center text-sm text-muted-foreground tabular-nums">
      {rank}
    </span>
  );
}

/** Top learners table with the current user highlighted. */
export function Leaderboard() {
  return (
    <Card id="leaderboard">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>
          Top learners this month — climb the ranks with consistent practice.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-80 sm:h-auto">
          <Table className="min-w-[560px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16 px-4">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Stars</TableHead>
                <TableHead className="text-right">Badges</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Courses
                </TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((entry) => (
                <TableRow
                  key={entry.name}
                  className={cn(
                    "hover:bg-muted/50",
                    entry.isCurrentUser && "bg-muted/60 hover:bg-muted/80"
                  )}
                >
                  <TableCell className="px-4">
                    <RankBadge rank={entry.rank} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback
                          className={cn(
                            "text-xs",
                            entry.isCurrentUser && "bg-foreground text-background"
                          )}
                        >
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-medium",
                            entry.isCurrentUser && "text-foreground"
                          )}
                        >
                          {entry.name}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1 tabular-nums">
                      <Star className="size-3.5 text-foreground/70" aria-hidden="true" />
                      {entry.stars}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1 tabular-nums">
                      <Award className="size-3.5 text-foreground/70" aria-hidden="true" />
                      {entry.badges}
                    </span>
                  </TableCell>
                  <TableCell className="hidden text-right tabular-nums md:table-cell">
                    <span className="inline-flex items-center justify-end gap-1">
                      <GraduationCap
                        className="size-3.5 text-foreground/70"
                        aria-hidden="true"
                      />
                      {entry.coursesCompleted}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1 font-medium tabular-nums">
                      <Zap className="size-3.5 text-foreground/70" aria-hidden="true" />
                      {entry.points.toLocaleString()}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-t p-4 text-center text-xs text-muted-foreground"
        >
          Rankings update daily at 00:00 UTC.
        </motion.div>
      </CardContent>
    </Card>
  );
}
