"use client";

import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/context/auth";
import { formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import { ArrowRight, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_URL!;

type ApiSession = {
  id: string;
  status: string;
  scheduled_at: string;
  meeting_link: string | null;
  interview_type: string | null;
  interviewer_id: string;
  interviewer_name: string;
  interviewee_id: string;
  interviewee_name: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/sessions/`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-1">Home</h1>
      <p className="text-[15px] text-muted-foreground mb-10">
        {loading
          ? "Loading…"
          : sessions.length > 0
          ? `${sessions.length} upcoming session${sessions.length > 1 ? "s" : ""}`
          : "No upcoming sessions"}
      </p>

      {/* Upcoming sessions */}
      {sessions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Upcoming
          </h2>
          <div className="flex flex-col gap-2">
            {sessions.map((session) => {
              const isInterviewer = session.interviewer_id === user?.id;
              const partnerName = isInterviewer
                ? session.interviewee_name
                : session.interviewer_name;

              return (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Avatar name={partnerName} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">{partnerName}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {session.interview_type
                        ? interviewTypeLabels[session.interview_type] ?? session.interview_type
                        : "Interview"}{" "}
                      &middot; {formatDate(session.scheduled_at)} at{" "}
                      {formatTime(
                        (() => {
                          const d = new Date(session.scheduled_at);
                          return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
                        })()
                      )}
                    </p>
                  </div>
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-foreground bg-accent rounded-lg hover:bg-accent-hover transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join
                    </a>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Find a partner CTA */}
      <section>
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Find a partner
        </h2>
        <Link
          href="/browse"
          className="flex items-center justify-between p-5 rounded-xl border border-border bg-card hover:bg-card-hover transition-colors group"
        >
          <div>
            <p className="text-[15px] font-semibold mb-1">Find your next partner</p>
            <p className="text-[13px] text-muted-foreground">
              Browse peers, pick a match, and book directly on their calendar.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-4" />
        </Link>
      </section>
    </div>
  );
}
