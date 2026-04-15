"use client";

import { Avatar } from "@/components/ui/avatar";
import { profilesApi, type ProfileUser } from "@/lib/services/profiles";
import { cn, difficultyLabels, interviewTypeLabels } from "@/lib/utils";
import { ExternalLink, Search, SlidersHorizontal, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const allExperiences = ["beginner", "intermediate", "advanced"];

interface Filters {
  interviewTypes: string[];
  timezones: string[];
  experiences: string[];
}

const emptyFilters: Filters = {
  interviewTypes: [],
  timezones: [],
  experiences: [],
};

function buildScheduleUrl(
  calComLink: string,
  interviewType: string | null
): string {
  if (!interviewType) return calComLink;
  const separator = calComLink.includes("?") ? "&" : "?";
  return `${calComLink}${separator}metadata[interviewType]=${encodeURIComponent(interviewType)}`;
}

function FilterSection({
  label,
  options,
  selected,
  onToggle,
  formatLabel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  formatLabel?: (value: string) => string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              "px-2.5 py-1 text-[12px] font-medium rounded-lg border transition-colors cursor-pointer",
              selected.includes(opt)
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
            )}
          >
            {formatLabel ? formatLabel(opt) : opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BrowsePage() {
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    profilesApi.list().then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allInterviewTypes = [...new Set(users.flatMap((u) => u.interview_types))];
  const allTimezones = [...new Set(users.map((u) => u.timezone))].sort();

  const activeFilterCount = Object.values(filters).reduce(
    (acc, arr) => acc + arr.length,
    0
  );

  function toggleFilter(category: keyof Filters, value: string) {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((v) => v !== value)
        : [...prev[category], value],
    }));
  }

  const peers = users
    .filter((u) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.bio.toLowerCase().includes(q) ||
        u.interview_types.some(
          (t) =>
            t.toLowerCase().includes(q) ||
            (interviewTypeLabels[t] ?? "").toLowerCase().includes(q)
        )
      );
    })
    .filter(
      (u) =>
        filters.interviewTypes.length === 0 ||
        filters.interviewTypes.some((t) => u.interview_types.includes(t))
    )
    .filter(
      (u) =>
        filters.timezones.length === 0 ||
        filters.timezones.includes(u.timezone)
    )
    .filter(
      (u) =>
        filters.experiences.length === 0 ||
        filters.experiences.includes(u.experience)
    );

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-6">Browse</h1>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or topic..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-[14px] bg-muted rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/15 transition-all"
        />
      </div>

      {/* Filter button */}
      <div className="relative mb-8" ref={filterRef}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg border transition-colors cursor-pointer",
              filterOpen || activeFilterCount > 0
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filter
            {activeFilterCount > 0 && (
              <span className="ml-0.5">({activeFilterCount})</span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters(emptyFilters)}
              className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="absolute top-full left-0 mt-2 w-[360px] bg-card border border-border rounded-xl shadow-lg p-4 z-20 flex flex-col gap-4">
            <FilterSection
              label="Interview Type"
              options={allInterviewTypes}
              selected={filters.interviewTypes}
              onToggle={(v) => toggleFilter("interviewTypes", v)}
              formatLabel={(v) => interviewTypeLabels[v] ?? v}
            />
            <FilterSection
              label="Timezone"
              options={allTimezones}
              selected={filters.timezones}
              onToggle={(v) => toggleFilter("timezones", v)}
              formatLabel={(v) => v.split("/")[1]?.replace("_", " ") ?? v}
            />
            <FilterSection
              label="Experience"
              options={allExperiences}
              selected={filters.experiences}
              onToggle={(v) => toggleFilter("experiences", v)}
              formatLabel={(v) => difficultyLabels[v] ?? v}
            />
          </div>
        )}
      </div>

      {/* Users list */}
      <div className="flex flex-col divide-y divide-border">
        {peers.map((user) => (
          <div key={user.id} className="py-5 first:pt-0 last:pb-0">
            <div className="flex items-start gap-4">
              <Avatar name={user.full_name} size="md" />

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium mb-0.5">{user.full_name}</p>

                {user.bio && (
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-1.5 text-[12px] mb-3">
                  {user.interview_types.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-muted rounded-md font-medium text-foreground"
                    >
                      {interviewTypeLabels[t] ?? t}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 bg-muted rounded-md text-muted-foreground">
                    {difficultyLabels[user.experience] ?? user.experience}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">
                    {user.timezone.split("/")[1]?.replace("_", " ") ?? user.timezone}
                  </span>

                  {user.cal_com_link ? (
                    <a
                      href={buildScheduleUrl(
                        user.cal_com_link,
                        filters.interviewTypes.length === 1
                          ? filters.interviewTypes[0]
                          : null
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
