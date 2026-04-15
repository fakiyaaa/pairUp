"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/context/auth";
import { sessionsApi, type ApiSession } from "@/lib/services/sessions";
import { cn, formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import { Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const tabs = ["Upcoming", "Completed"];

export default function SessionsPage() {
  const { user } = useAuth();
  const [active, setActive] = useState("Upcoming");
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetch = active === "Upcoming"
      ? sessionsApi.listUpcoming()
      : sessionsApi.listCompleted();

    fetch
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [active]);

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

      {loading ? (
        <p className="text-[14px] text-muted-foreground">Loading…</p>
      ) : sessions.length === 0 ? (
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
          {sessions.map((session) => {
            const isInterviewer = session.interviewer_id === user?.id;
            const partnerName = isInterviewer
              ? session.interviewee_name
              : session.interviewer_name;
            const partnerCalLink = isInterviewer
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
                    {partnerCalLink && (
                      canReschedule(session.scheduled_at) ? (
                        <a
                          href={partnerCalLink}
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
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
