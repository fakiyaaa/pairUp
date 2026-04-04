"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser, sessions } from "@/lib/mock-data";
import { cn, formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import { Calendar, CheckCircle2, Clock, Star, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const tabs = ["Upcoming", "Completed"];

export default function SessionsPage() {
  const [active, setActive] = useState("Upcoming");

  const upcoming = sessions.filter((s) => s.status === "confirmed");
  const completed = sessions.filter((s) => s.status === "completed");
  const list = active === "Upcoming" ? upcoming : completed;

  const canReschedule = (scheduledAt: string) => {
    const oneHour = 1000 * 60 * 60;
    return new Date(scheduledAt).getTime() - Date.now() > oneHour;
  };

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-6">
        Sessions
      </h1>

      <div className="flex gap-1 mb-8">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={cn(
              "px-3 py-1 text-[13px] font-medium rounded-lg transition-colors cursor-pointer",
              active === t
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-muted-foreground mb-4">
            {active === "Upcoming"
              ? "No upcoming sessions."
              : "No completed sessions yet."}
          </p>
          {active === "Upcoming" && (
            <Link href="/browse">
              <Button variant="secondary" size="sm">
                Browse posts
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {list.map((session) => {
            const isInterviewer = session.interviewer.id === currentUser.id;
            const partner = isInterviewer
              ? session.interviewee
              : session.interviewer;
            const scheduled = new Date(session.scheduledAt);

            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity"
              >
                <Avatar name={partner.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">{partner.name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {interviewTypeLabels[session.interviewType]} &middot;{" "}
                    {formatDate(session.scheduledAt)} at{" "}
                    {formatTime(
                      `${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
                    )}{" "}
                    &middot; {session.duration}m
                  </p>
                </div>
                {session.status === "confirmed" && (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="text-[12px] font-medium text-foreground bg-accent px-2 py-1 rounded-md flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      Join
                    </span>
                    {canReschedule(session.scheduledAt) ? (
                      <a
                        href={partner.schedulingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-medium text-muted-foreground border border-border px-2 py-1 rounded-md hover:text-foreground transition-colors"
                      >
                        Reschedule
                      </a>
                    ) : (
                      <span
                        title="Cannot reschedule within 1 hour of session"
                        className="text-[12px] font-medium text-muted-foreground/40 border border-border px-2 py-1 rounded-md cursor-not-allowed"
                      >
                        Reschedule
                      </span>
                    )}
                  </div>
                )}
                {session.status === "completed" && session.feedback && (
                  <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {session.feedback.rating}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
