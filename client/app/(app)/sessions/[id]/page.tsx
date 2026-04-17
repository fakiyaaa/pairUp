"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { currentUser, sessions } from "@/lib/mock-data";
import { sessionsApi, type PersistedFeedback } from "@/lib/services/sessions";
import {
  formatDate,
  formatTime,
  interviewTypeLabels,
  difficultyLabels,
} from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Video,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

function ScoreSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted-foreground block mb-1.5">
        {label}
      </span>
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 text-[14px] bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
      >
        <option value="" disabled>
          Select…
        </option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const session = useMemo(() => sessions.find((s) => s.id === id), [id]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [persistedFeedback, setPersistedFeedback] =
    useState<PersistedFeedback | null>(null);
  const [communication, setCommunication] = useState(0);
  const [preparedness, setPreparedness] = useState(0);
  const [technicalSkill, setTechnicalSkill] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [notes, setNotes] = useState("");

  const effectiveFeedback = useMemo(() => {
    if (persistedFeedback) {
      return {
        communication: persistedFeedback.communication,
        preparedness: persistedFeedback.preparedness,
        technicalSkill: persistedFeedback.technical_skill,
        strengths: persistedFeedback.strengths || "",
        improvements: persistedFeedback.improvements || "",
        notes: persistedFeedback.notes || "",
        fromUser: { name: persistedFeedback.from_user_name },
      };
    }
    return session?.feedback;
  }, [persistedFeedback, session?.feedback]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeedback() {
      if (!session) return;
      try {
        const res = await sessionsApi.getFeedback(session.id);
        if (!cancelled) setPersistedFeedback(res.feedback);
      } catch {
        // Keep UI usable with mock fallback if backend fetch fails.
      }
    }

    loadFeedback();
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-[14px] text-muted-foreground mb-4">
          Session not found.
        </p>
        <Link href="/sessions">
          <Button variant="secondary" size="sm">
            Back
          </Button>
        </Link>
      </div>
    );
  }

  const isInterviewer = session.interviewer.id === currentUser.id;
  const partner = isInterviewer ? session.interviewee : session.interviewer;
  const sessionId = session.id;
  const scheduled = new Date(session.scheduledAt);

  async function handleSubmitFeedback() {
    if (!communication || !preparedness || !technicalSkill) {
      setError("Please add scores before submitting.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await sessionsApi.createFeedback(sessionId, {
        from_user_id: currentUser.id,
        from_user_name: currentUser.name,
        to_user_id: partner.id,
        communication,
        preparedness,
        technical_skill: technicalSkill,
        strengths,
        improvements,
        notes,
      });
      setPersistedFeedback(res.feedback);
      setSubmitted(true);
      setShowFeedback(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Link
        href="/sessions"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Sessions
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar name={partner.name} size="lg" />
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">
            {interviewTypeLabels[session.interviewType]} with {partner.name}
          </h1>
          <p className="text-[14px] text-muted-foreground">
            {formatDate(session.scheduledAt)} at{" "}
            {formatTime(
              `${scheduled.getHours()}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
            )}{" "}
            &middot; {session.duration} min &middot;{" "}
            {difficultyLabels[session.difficulty]}
          </p>
        </div>
      </div>

      {/* Join banner */}
      {session.status === "confirmed" && (
        <div className="flex gap-3 mb-8">
          <a
            href={session.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-border/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Video className="w-5 h-5 text-foreground" />
              <div>
                <p className="text-[14px] font-medium">Join meeting</p>
                <p className="text-[12px] text-muted-foreground">
                  {session.meetingLink}
                </p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>

          {Date.now() <
          new Date(session.scheduledAt).getTime() - 1000 * 60 * 60 ? (
            <a
              href={partner.schedulingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 bg-muted rounded-xl hover:bg-border/60 transition-colors text-[14px] font-medium"
            >
              <Calendar className="w-4 h-4" />
              Reschedule
            </a>
          ) : (
            <div
              title="Cannot reschedule within 1 hour of session"
              className="flex items-center gap-2 px-4 bg-muted rounded-xl text-[14px] font-medium text-muted-foreground/40 cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" />
              Reschedule
            </div>
          )}
        </div>
      )}

      {/* Details */}
      <section className="mb-8">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Details
        </h2>
        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
          <div>
            <p className="text-muted-foreground text-[12px] mb-0.5">
              Your role
            </p>
            <p className="font-medium">
              {isInterviewer ? "Interviewer" : "Interviewee"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-[12px] mb-0.5">Status</p>
            <p className="font-medium capitalize">{session.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[12px] mb-0.5">Topics</p>
            <p className="font-medium">{session.topics.join(", ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[12px] mb-0.5">
              Partner timezone
            </p>
            <p className="font-medium">{partner.timezone}</p>
          </div>
        </div>
      </section>

      {/* Partner info */}
      <section className="mb-8">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Partner
        </h2>
        <div className="flex items-start gap-4">
          <Avatar name={partner.name} size="md" />
          <div>
            <p className="text-[14px] font-medium">{partner.name}</p>
            <p className="text-[13px] text-muted-foreground mb-1">
              {partner.completedSessions} sessions
            </p>
            {partner.bio && (
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {partner.bio}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Feedback received */}
      {effectiveFeedback && (
        <section className="mb-8">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Feedback
          </h2>
          <div className="space-y-4">
            <p className="text-[13px] text-muted-foreground">
              from {effectiveFeedback.fromUser.name}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Communication",
                  value: effectiveFeedback.communication,
                },
                {
                  label: "Preparedness",
                  value: effectiveFeedback.preparedness,
                },
                {
                  label: "Technical",
                  value: effectiveFeedback.technicalSkill,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center p-3 bg-muted rounded-xl"
                >
                  <p className="text-[18px] font-bold">{item.value}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {effectiveFeedback.strengths && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Strengths
                </p>
                <p className="text-[14px] leading-relaxed">
                  {effectiveFeedback.strengths}
                </p>
              </div>
            )}
            {effectiveFeedback.improvements && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Improvements
                </p>
                <p className="text-[14px] leading-relaxed">
                  {effectiveFeedback.improvements}
                </p>
              </div>
            )}
            {effectiveFeedback.notes && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-[14px] leading-relaxed">
                  {effectiveFeedback.notes}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feedback form */}
      {session.status === "completed" && !effectiveFeedback && !submitted && (
        <section>
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="text-[13px] font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground cursor-pointer"
            >
              Leave feedback for {partner.name}
            </button>
          ) : (
            <div>
              <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Leave feedback
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <ScoreSelect
                    label="Communication"
                    value={communication}
                    onChange={setCommunication}
                  />
                  <ScoreSelect
                    label="Preparedness"
                    value={preparedness}
                    onChange={setPreparedness}
                  />
                  <ScoreSelect
                    label="Technical"
                    value={technicalSkill}
                    onChange={setTechnicalSkill}
                  />
                </div>
                <Textarea
                  label="Strengths"
                  placeholder="What did they do well?"
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                />
                <Textarea
                  label="Improvements"
                  placeholder="What could they work on?"
                  rows={2}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                />
                <Textarea
                  label="Notes"
                  placeholder="Anything else..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowFeedback(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitFeedback} disabled={saving}>
                    {saving ? "Submitting..." : "Submit"}
                  </Button>
                </div>
                {error && <p className="text-[13px] text-red-500">{error}</p>}
              </div>
            </div>
          )}
        </section>
      )}

      {submitted && (
        <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Feedback submitted.
        </p>
      )}

      {/* Cancel */}
      {session.status === "confirmed" && (
        <div className="mt-10 pt-6 border-t border-border">
          <button className="text-[13px] text-danger hover:underline cursor-pointer">
            Cancel session
          </button>
        </div>
      )}
    </div>
  );
}
