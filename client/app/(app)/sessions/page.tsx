"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth";
import { type ApiSession, sessionsApi } from "@/lib/services/sessions";
import { cn, formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import { Star, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const tabs = ["Upcoming", "Completed"];

const canReschedule = (scheduledAt: string) => {
  const oneHour = 1000 * 60 * 60;
  return new Date(scheduledAt).getTime() - Date.now() > oneHour;
};

export default function SessionsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState("Upcoming");
  const [upcoming, setUpcoming] = useState<ApiSession[]>([]);
  const [completed, setCompleted] = useState<ApiSession[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [completedFetched, setCompletedFetched] = useState(false);

  useEffect(() => {
    sessionsApi
      .listUpcoming()
      .then(setUpcoming)
      .catch(() => setUpcoming([]))
      .finally(() => setUpcomingLoading(false));
  }, []);

  function handleTabChange(tab: string) {
    setActive(tab);
    if (tab === "Completed" && !completedFetched) {
      setCompletedLoading(true);
      sessionsApi
        .listCompleted()
        .then(setCompleted)
        .catch(() => setCompleted([]))
        .finally(() => {
          setCompletedLoading(false);
          setCompletedFetched(true);
        });
    }
  }

  const list = active === "Upcoming" ? upcoming : completed;
  const loading = active === "Upcoming" ? upcomingLoading : completedLoading;

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-6">
        Sessions
      </h1>

      <div className="flex gap-1 mb-8">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
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

      {loading ? (
        <p className="text-[14px] text-muted-foreground py-20 text-center">
          Loading…
        </p>
      ) : list.length === 0 ? (
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
            if (!session.interviewer_id || !session.interviewee_id) return null;
            const isInterviewer = session.interviewer_id === user?.id;
            const partnerName = isInterviewer
              ? session.interviewee_name
              : session.interviewer_name;
            const partnerCalComLink = isInterviewer
              ? session.interviewee_cal_com_link
              : session.interviewer_cal_com_link;
            const scheduled = new Date(session.scheduled_at);

            return (
              <Link
                key={session.id}
                href={`/sessions/${session.id}`}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity"
              >
                <Avatar name={partnerName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium">{partnerName}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {session.interview_type
                      ? (interviewTypeLabels[session.interview_type] ?? session.interview_type)
                      : "Interview"}{" "}
                    &middot; {formatDate(session.scheduled_at)} at{" "}
                    {formatTime(
                      `${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
                    )}
                  </p>
                </div>
                {session.status === "confirmed" && (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] font-medium text-foreground bg-accent px-2 py-1 rounded-md flex items-center gap-1"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join
                      </a>
                    )}
                    {partnerCalComLink && (
                      canReschedule(session.scheduled_at) ? (
                        <a
                          href={partnerCalComLink}
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
                      )
                    )}
                  </div>
                )}
                {session.status === "completed" && (
                  <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    Completed
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
