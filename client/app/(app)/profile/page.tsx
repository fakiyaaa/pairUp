"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { profileApi, type ProfileData } from "@/lib/services/profile";
import { authApi } from "@/lib/services/auth";
import { calApi } from "@/lib/services/cal";
import { cn, difficultyLabels, formatDate, interviewTypeLabels } from "@/lib/utils";
import type { Difficulty } from "@/lib/types";
import { ExternalLink, Link2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  "Market Sizing", "Profitability", "Go-to-Market", "Leadership",
  "Conflict Resolution", "React", "Node.js", "API Design", "Python",
  "SQL", "Statistics", "Brain Teasers",
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectingCal, setConnectingCal] = useState(false);
  const [calError, setCalError] = useState(searchParams.get("cal") === "error" ? "Failed to connect Cal.com — please try again." : "");

  // Edit form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [experience, setExperience] = useState<Difficulty>("intermediate");
  const [schedulingUrl, setSchedulingUrl] = useState("");

  useEffect(() => {
    profileApi
      .getMe()
      .then((data) => {
        setProfile(data);
        setName(data.full_name);
        setBio(data.bio ?? "");
        setTimezone(data.timezone ?? "");
        setSelectedTypes(data.interview_types ?? []);
        setSelectedTopics(data.topics ?? []);
        setExperience((data.experience as Difficulty) ?? "intermediate");
        setSchedulingUrl(data.cal_com_link ?? "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function startEditing() {
    if (!profile) return;
    setName(profile.full_name);
    setBio(profile.bio ?? "");
    setTimezone(profile.timezone ?? "");
    setSelectedTypes(profile.interview_types ?? []);
    setSelectedTopics(profile.topics ?? []);
    setExperience((profile.experience as Difficulty) ?? "intermediate");
    setSchedulingUrl(profile.cal_com_link ?? "");
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await profileApi.updateMe({
        full_name: name,
        bio,
        timezone,
        interview_types: selectedTypes,
        topics: selectedTopics,
        experience,
        cal_com_link: schedulingUrl,
      });
      setProfile(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleConnectCal() {
    setConnectingCal(true);
    setCalError("");
    try {
      const { url } = await calApi.getConnectUrl();
      window.location.href = url;
    } catch {
      setCalError("Failed to start Cal.com connection — please try again.");
      setConnectingCal(false);
    }
  }

  const toggleType = (id: string) =>
    setSelectedTypes((prev: string[]) =>
      prev.includes(id) ? prev.filter((t: string) => t !== id) : [...prev, id]
    );

  const toggleTopic = (topic: string) =>
    setSelectedTopics((prev: string[]) =>
      prev.includes(topic) ? prev.filter((t: string) => t !== topic) : [...prev, topic]
    );

  if (loading) {
    return <p className="text-[14px] text-muted-foreground">Loading…</p>;
  }

  if (error || !profile) {
    return <p className="text-[14px] text-destructive">{error || "Profile not found."}</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold tracking-tight">Profile</h1>
        {!editing ? (
          <button
            onClick={startEditing}
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
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10">
        <Avatar name={profile.full_name} size="xl" />
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
                placeholder="About you…"
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
              <h2 className="text-[18px] font-semibold">{profile.full_name}</h2>
              <p className="text-[13px] text-muted-foreground mb-2">
                {profile.email} &middot; {profile.timezone}
              </p>
              {profile.bio && (
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-[13px] text-muted-foreground">
                <span>Joined {formatDate(profile.created_at)}</span>
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
              <label className="text-[13px] font-medium block mb-2">Topics</label>
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
            {profile.interview_types.length > 0 && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-1.5">
                  Interview types
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interview_types.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[12px] bg-muted rounded-md font-medium"
                    >
                      {interviewTypeLabels[t] ?? t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {profile.experience && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-1.5">
                  Experience
                </p>
                <p className="text-[14px] font-medium">
                  {difficultyLabels[profile.experience] ?? profile.experience}
                </p>
              </div>
            )}
            {profile.topics.length > 0 && (
              <div>
                <p className="text-[12px] text-muted-foreground mb-1.5">Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.topics.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[12px] bg-muted rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Upcoming sessions */}
      {profile.upcoming_sessions.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Upcoming sessions
          </h2>
          <div className="flex flex-col divide-y divide-border">
            {profile.upcoming_sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <Avatar name={session.partner_name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{session.partner_name}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {interviewTypeLabels[session.interview_type] ?? session.interview_type}{" "}
                    &middot; {formatDate(session.scheduled_at)}
                  </p>
                </div>
                {session.meeting_link && (
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scheduling link */}
      <section className="mb-10">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Scheduling
        </h2>

        {profile.cal_webhook_id || searchParams.get("cal") === "connected" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-success font-medium">✓ Cal.com connected</span>
              {profile.cal_com_link && (
                <a
                  href={profile.cal_com_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground"
                >
                  {profile.cal_com_link.replace(/^https?:\/\//, "")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <Button size="sm" variant="secondary" onClick={handleConnectCal} disabled={connectingCal}>
              {connectingCal ? "Redirecting…" : "Reconnect Cal.com"}
            </Button>
            {calError && <p className="text-[13px] text-danger">{calError}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[14px] text-muted-foreground">
              Connect your Cal.com account so PairUp can match your availability with others and auto-create sessions when a booking is made.
            </p>
            <Button size="sm" variant="secondary" onClick={handleConnectCal} disabled={connectingCal}>
              {connectingCal ? "Redirecting…" : "Connect Cal.com"}
            </Button>
            {calError && <p className="text-[13px] text-danger">{calError}</p>}
            {editing && (
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="Or paste any scheduling link (Calendly, etc.)"
                  value={schedulingUrl}
                  onChange={(e) => setSchedulingUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-[14px] bg-card border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            )}
          </div>
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
