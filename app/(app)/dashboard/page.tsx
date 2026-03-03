"use client";

import { Avatar } from "@/components/ui/avatar";
import { currentUser, sessions, users } from "@/lib/mock-data";
import { formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import { ArrowRight, Video } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const upcomingSessions = sessions.filter((s) => s.status === "confirmed");
  const interviewerCount = users.filter(
    (u) => u.id !== currentUser.id && (u.role === "interviewer" || u.role === "both")
  ).length;

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-1">Home</h1>
      <p className="text-[15px] text-muted-foreground mb-10">
        {upcomingSessions.length > 0
          ? `${upcomingSessions.length} upcoming session${upcomingSessions.length > 1 ? "s" : ""}`
          : "No upcoming sessions"}
      </p>

      {/* Upcoming sessions */}
      {upcomingSessions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Upcoming
          </h2>
          <div className="flex flex-col gap-2">
            {upcomingSessions.map((session) => {
              const isInterviewer = session.interviewer.id === currentUser.id;
              const partner = isInterviewer
                ? session.interviewee
                : session.interviewer;
              const scheduled = new Date(session.scheduledAt);

              return (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Avatar name={partner.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium">{partner.name}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {interviewTypeLabels[session.interviewType]} &middot;{" "}
                      {formatDate(session.scheduledAt)} at{" "}
                      {formatTime(
                        `${scheduled.getHours()}:${String(
                          scheduled.getMinutes()
                        ).padStart(2, "0")}`
                      )}
                    </p>
                  </div>
                  <a
                    href={session.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-foreground bg-accent rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join
                  </a>
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
            <p className="text-[15px] font-semibold mb-1">
              {interviewerCount} interviewer{interviewerCount !== 1 ? "s" : ""} available
            </p>
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
