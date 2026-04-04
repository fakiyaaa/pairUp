"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { currentUser, sessions } from "@/lib/mock-data";
import {
  cn,
  difficultyLabels,
  formatDate,
  interviewTypeLabels,
} from "@/lib/utils";
import type { Difficulty } from "@/lib/types";
import {
  ExternalLink,
  Link2,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/services/auth";

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
];

const interviewTypes = [
  { id: "technical", label: "Technical" },
  { id: "behavioral", label: "Behavioral" },
  { id: "case", label: "Case Study" },
  { id: "product", label: "Product" },
];

const allTopics = [
  "Data Structures", "Algorithms", "System Design", "Dynamic Programming",
  "Machine Learning", "Product Sense", "Metrics", "Strategy",
  "Market Sizing", "Leadership", "React", "Node.js", "API Design", "Python",
];

export default function ProfilePage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [timezone, setTimezone] = useState(currentUser.timezone);
  const [selectedTypes, setSelectedTypes] = useState(
    currentUser.interviewTypes as string[]
  );
  const [selectedTopics, setSelectedTopics] = useState(currentUser.topics);
  const [experience, setExperience] = useState<Difficulty>(
    currentUser.experienceLevel
  );
  const [schedulingUrl, setSchedulingUrl] = useState(
    currentUser.schedulingUrl || ""
  );

  const completed = sessions.filter((s) => s.status === "completed");

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-[13px] font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground cursor-pointer"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(false)}
              className="text-[13px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <Button size="sm" onClick={() => setEditing(false)}>
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10">
        <Avatar name={currentUser.name} size="xl" />
        <div className="flex-1">
          {editing ? (
            <div className="space-y-4">
              <Input
                id="name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                id="bio"
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="About you..."
              />
              <Select
                id="tz"
                label="Timezone"
                options={timezones}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          ) : (
            <>
              <h2 className="text-[18px] font-semibold">{name}</h2>
              <p className="text-[13px] text-muted-foreground mb-2">
                {currentUser.email} &middot; {timezone}
              </p>
              <p className="text-[14px] text-muted-foreground leading-relaxed">
                {bio}
              </p>
              <div className="flex items-center gap-4 mt-3 text-[13px] text-muted-foreground">
                <span>
                  {currentUser.completedSessions} sessions
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {currentUser.rating}
                </span>
                <span>
                  Joined {formatDate(currentUser.joinedAt)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preferences */}
      <section className="mb-10">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Preferences
        </h2>

        {editing ? (
          <div className="space-y-6">
            <div>
              <label className="text-[13px] font-medium block mb-2">
                Interview types
              </label>
              <div className="flex flex-wrap gap-2">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={cn(
                      "px-3 py-1.5 text-[13px] font-medium rounded-lg border transition-all cursor-pointer",
                      selectedTypes.includes(type.id)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <Select
              id="exp"
              label="Experience level"
              options={[
                { value: "beginner", label: "Beginner" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
              value={experience}
              onChange={(e) => setExperience(e.target.value as Difficulty)}
            />

            <div>
              <label className="text-[13px] font-medium block mb-2">
                Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {allTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      "px-3 py-1.5 text-[13px] font-medium rounded-lg border transition-all cursor-pointer",
                      selectedTopics.includes(topic)
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-muted-foreground mb-1.5">
                Interview types
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTypes.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[12px] bg-muted rounded-md font-medium"
                  >
                    {interviewTypeLabels[t]}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground mb-1.5">
                Experience
              </p>
              <p className="text-[14px] font-medium">
                {difficultyLabels[experience]}
              </p>
            </div>
            <div>
              <p className="text-[12px] text-muted-foreground mb-1.5">Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTopics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[12px] bg-muted rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Recent sessions */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Recent sessions
          </h2>
          <div className="flex flex-col divide-y divide-border">
            {completed.map((session) => {
              const partner =
                session.interviewer.id === currentUser.id
                  ? session.interviewee
                  : session.interviewer;
              return (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80 transition-opacity"
                >
                  <Avatar name={partner.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium">{partner.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {interviewTypeLabels[session.interviewType]} &middot;{" "}
                      {formatDate(session.scheduledAt)}
                    </p>
                  </div>
                  {session.feedback && (
                    <span className="flex items-center gap-1 text-[12px] text-muted-foreground">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {session.feedback.rating}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Scheduling link */}
      <section className="mb-10">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Scheduling
        </h2>
        {editing ? (
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="url"
              placeholder="calendly.com/yourname"
              value={schedulingUrl}
              onChange={(e) => setSchedulingUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[14px] bg-card border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            />
          </div>
        ) : schedulingUrl ? (
          <a
            href={schedulingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[14px] text-foreground hover:underline underline-offset-2"
          >
            {schedulingUrl.replace(/^https?:\/\//, "")}
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </a>
        ) : (
          <p className="text-[14px] text-muted-foreground">
            No scheduling link yet.{" "}
            <button
              onClick={() => setEditing(true)}
              className="text-foreground underline underline-offset-2 cursor-pointer"
            >
              Add one
            </button>
          </p>
        )}
      </section>

      {/* Sign out */}
      <div className="mt-12 pt-6 border-t border-border">
        <button
          onClick={async () => {
            await authApi.logout();
            router.push("/");
          }}
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
