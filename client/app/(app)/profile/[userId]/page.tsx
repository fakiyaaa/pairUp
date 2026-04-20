"use client";

import { Avatar } from "@/components/ui/avatar";
import { profileApi, type ProfileData } from "@/lib/services/profile";
import { difficultyLabels, interviewTypeLabels } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const roleDisplay: Record<string, string> = {
  interviewee: "I want to practice",
  interviewer: "I can run interviews",
  both: "Interviewer and Interviewee",
};

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    profileApi
      .getPublic(userId)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return <p className="text-[14px] text-muted-foreground">Loading…</p>;
  }

  if (notFound || !profile) {
    return <p className="text-[14px] text-destructive">Profile not found.</p>;
  }

  return (
    <div>
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10">
        <Avatar name={profile.full_name} size="xl" />
        <div className="flex-1">
          <h2 className="text-[18px] font-semibold">{profile.full_name}</h2>
          {profile.timezone && (
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {profile.timezone.split("/")[1]?.replace("_", " ") ?? profile.timezone}
            </p>
          )}
          {profile.bio && (
            <p className="text-[14px] text-muted-foreground leading-relaxed mt-2">
              {profile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Preferences */}
      <section className="mb-10">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Preferences
        </h2>
        <div className="space-y-4">
          {profile.role && (
            <div>
              <p className="text-[12px] text-muted-foreground mb-1.5">Role</p>
              <p className="text-[14px] font-medium">
                {roleDisplay[profile.role] ?? profile.role}
              </p>
            </div>
          )}
          {profile.interview_types.length > 0 && (
            <div>
              <p className="text-[12px] text-muted-foreground mb-1.5">
                Interview types
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.interview_types.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[12px] bg-muted rounded-md font-medium capitalize"
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
                    key={t.id}
                    className="px-2 py-0.5 text-[12px] bg-muted rounded-md"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Target role */}
      {profile.target_role && (
        <section className="mb-10">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Relevant opportunities
          </h2>
          <p className="text-[14px]">{profile.target_role}</p>
        </section>
      )}

      {/* Scheduling */}
      {profile.cal_com_link && (
        <section className="mb-10">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Scheduling
          </h2>
          <a
            href={profile.cal_com_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium bg-accent hover:bg-accent-hover text-foreground rounded-lg transition-colors"
          >
            Schedule a session
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </section>
      )}
    </div>
  );
}
