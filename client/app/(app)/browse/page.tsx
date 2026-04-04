"use client";

import { Avatar } from "@/components/ui/avatar";
import { currentUser, users } from "@/lib/mock-data";
import { cn, difficultyLabels, interviewTypeLabels } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { ExternalLink, Search, Star } from "lucide-react";
import { useState } from "react";

const typeFilters = ["All", "Technical", "Behavioral", "Case", "Product"];

function buildScheduleUrl(schedulingUrl: string, interviewType: string | null): string {
  if (!interviewType) return schedulingUrl;
  const separator = schedulingUrl.includes("?") ? "&" : "?";
  return `${schedulingUrl}${separator}metadata[interviewType]=${encodeURIComponent(interviewType)}`;
}

const roleLabels: Record<UserRole, string> = {
  interviewer: "Interviewer",
  interviewee: "Interviewee",
  both: "Both",
};

export default function BrowsePage() {
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");

  const peers = users
    .filter((u) => u.id !== currentUser.id)
    .filter((u) => {
      if (activeType === "All") return true;
      return u.interviewTypes.includes(activeType.toLowerCase() as never);
    })
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.topics.some((t) => t.toLowerCase().includes(q)) ||
        u.bio?.toLowerCase().includes(q) ||
        u.interviewTypes.some(
          (t) =>
            t.toLowerCase().includes(q) ||
            interviewTypeLabels[t].toLowerCase().includes(q)
        )
      );
    });

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-6">Browse</h1>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-[14px] bg-muted rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
        />
      </div>

      {/* Type filter */}
      <div className="flex gap-1 mb-8">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveType(f)}
            className={cn(
              "px-3 py-1 text-[13px] font-medium rounded-lg transition-colors cursor-pointer",
              activeType === f
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Users list */}
      <div className="flex flex-col divide-y divide-border">
        {peers.map((user) => (
          <div key={user.id} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-4">
              <Avatar name={user.name} size="md" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[14px] font-medium">{user.name}</p>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[11px] font-medium rounded-md",
                      user.role === "interviewer"
                        ? "bg-success-light text-success"
                        : user.role === "interviewee"
                        ? "bg-accent-light text-warning"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {roleLabels[user.role]}
                  </span>
                </div>

                {user.bio && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 text-[12px] mb-3">
                  {user.interviewTypes.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-muted rounded-md font-medium text-foreground"
                    >
                      {interviewTypeLabels[t]}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                    {difficultyLabels[user.experienceLevel]}
                  </span>
                  {user.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 bg-muted rounded-md text-muted-foreground"
                    >
                      {topic}
                    </span>
                  ))}
                  {user.topics.length > 3 && (
                    <span className="text-muted-foreground">
                      +{user.topics.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {user.rating}
                    </span>
                    <span>{user.completedSessions} sessions</span>
                    <span>{user.timezone.split("/")[1]?.replace("_", " ")}</span>
                  </span>

                  {user.schedulingUrl ? (
                    <a
                      href={buildScheduleUrl(
                        user.schedulingUrl,
                        activeType !== "All" ? activeType.toLowerCase() : null
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium bg-accent hover:bg-accent-hover text-foreground rounded-lg transition-colors"
                    >
                      Schedule
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[12px] text-muted-foreground italic">
                      No link yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {peers.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[14px] text-muted-foreground">No matches found.</p>
        </div>
      )}
    </div>
  );
}
