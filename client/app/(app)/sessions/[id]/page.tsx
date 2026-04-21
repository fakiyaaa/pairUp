"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/context/auth";
import {
  type ApiSession,
  type PersistedFeedback,
  sessionsApi,
} from "@/lib/services/sessions";
import { formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Star,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

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
  const { user } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<ApiSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [feedback, setFeedback] = useState<PersistedFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [rating, setRating] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [preparedness, setPreparedness] = useState(0);
  const [technicalSkill, setTechnicalSkill] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    sessionsApi
      .get(id)
      .then(setSession)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!session) return;
    sessionsApi
      .getFeedback(id)
      .then((res) => setFeedback(res.feedback))
      .catch(() => {});
  }, [id, session]);

  async function handleSubmitFeedback() {
    if (!session || !user) return;
    if (!rating || !communication || !preparedness || !technicalSkill) {
      setFormError("Please fill in all ratings before submitting.");
      return;
    }

    const isInterviewer = session.interviewer_id === user.id;
    const toUserId = isInterviewer ? session.interviewee_id : session.interviewer_id;

    setSaving(true);
    setFormError("");
    try {
      const res = await sessionsApi.createFeedback(id, {
        from_user_id: user.id,
        from_user_name: user.full_name ?? user.email,
        to_user_id: toUserId,
        rating,
        communication,
        preparedness,
        technical_skill: technicalSkill,
        strengths,
        improvements,
        notes,
      });
      setFeedback(res.feedback);
      setSubmitted(true);
      setShowFeedback(false);
    } catch {
      setFormError("Failed to submit feedback. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setCancelError("");
    try {
      await sessionsApi.cancel(id);
      router.push("/sessions");
    } catch {
      setCancelError("Failed to cancel session. Please try again.");
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <p className="text-[14px] text-muted-foreground py-20 text-center">
        Loading…
      </p>
    );
  }

  if (notFound || !session || !session.interviewer_id || !session.interviewee_id) {
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

  const isInterviewer = session.interviewer_id === user?.id;
  const partnerName = isInterviewer
    ? session.interviewee_name
    : session.interviewer_name;
  const partnerBio = isInterviewer
    ? session.interviewee_bio
    : session.interviewer_bio;
  const partnerTimezone = isInterviewer
    ? session.interviewee_timezone
    : session.interviewer_timezone;
  const partnerCalComLink = isInterviewer
    ? session.interviewee_cal_com_link
    : session.interviewer_cal_com_link;

  const scheduled = new Date(session.scheduled_at);
  const canReschedule =
    Date.now() < new Date(session.scheduled_at).getTime() - 1000 * 60 * 60;

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
        <Avatar name={partnerName} size="lg" />
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">
            {session.interview_type
              ? (interviewTypeLabels[session.interview_type] ??
                session.interview_type)
              : "Interview"}{" "}
            with {partnerName}
          </h1>
          <p className="text-[14px] text-muted-foreground">
            {formatDate(session.scheduled_at)} at{" "}
            {formatTime(
              `${String(scheduled.getHours()).padStart(2, "0")}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
            )}
          </p>
        </div>
      </div>

      {/* Join + Reschedule banner */}
      {session.status === "confirmed" && (
        <div className="flex gap-3 mb-8">
          {session.meeting_link && (
            <a
              href={session.meeting_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-between p-4 bg-muted rounded-xl hover:bg-border/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-foreground" />
                <div>
                  <p className="text-[14px] font-medium">Join meeting</p>
                  <p className="text-[12px] text-muted-foreground">
                    {session.meeting_link}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          )}

          {partnerCalComLink ? (
            canReschedule ? (
              <a
                href={partnerCalComLink}
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
            )
          ) : null}
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
          {partnerTimezone && (
            <div>
              <p className="text-muted-foreground text-[12px] mb-0.5">
                Partner timezone
              </p>
              <p className="font-medium">{partnerTimezone}</p>
            </div>
          )}
        </div>
      </section>

      {/* Partner info */}
      <section className="mb-8">
        <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Partner
        </h2>
        <div className="flex items-start gap-4">
          <Avatar name={partnerName} size="md" />
          <div>
            <p className="text-[14px] font-medium">{partnerName}</p>
            {partnerBio && (
              <p className="text-[13px] text-muted-foreground leading-relaxed mt-1">
                {partnerBio}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Feedback received */}
      {feedback && (
        <section className="mb-8">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Feedback
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-[14px] font-medium">{feedback.rating}/5</span>
              <span className="text-[13px] text-muted-foreground">
                from {feedback.from_user_name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Communication", value: feedback.communication },
                { label: "Preparedness", value: feedback.preparedness },
                { label: "Technical", value: feedback.technical_skill },
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

            {feedback.strengths && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Strengths
                </p>
                <p className="text-[14px] leading-relaxed">{feedback.strengths}</p>
              </div>
            )}
            {feedback.improvements && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Improvements
                </p>
                <p className="text-[14px] leading-relaxed">{feedback.improvements}</p>
              </div>
            )}
            {feedback.notes && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-[14px] leading-relaxed">{feedback.notes}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feedback form */}
      {session.status === "completed" && !feedback && !submitted && (
        <section>
          {!showFeedback ? (
            <button
              onClick={() => setShowFeedback(true)}
              className="text-[13px] font-medium text-foreground underline underline-offset-2 decoration-border hover:decoration-foreground cursor-pointer"
            >
              Leave feedback for {partnerName}
            </button>
          ) : (
            <div>
              <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Leave feedback
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-4 gap-4">
                  <ScoreSelect label="Overall" value={rating} onChange={setRating} />
                  <ScoreSelect label="Communication" value={communication} onChange={setCommunication} />
                  <ScoreSelect label="Preparedness" value={preparedness} onChange={setPreparedness} />
                  <ScoreSelect label="Technical" value={technicalSkill} onChange={setTechnicalSkill} />
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
                {formError && (
                  <p className="text-[13px] text-danger">{formError}</p>
                )}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowFeedback(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitFeedback} disabled={saving}>
                    {saving ? "Submitting…" : "Submit"}
                  </Button>
                </div>
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
          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-[13px] text-danger hover:underline cursor-pointer"
            >
              Cancel session
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[14px] font-medium">Cancel this session?</p>
              <p className="text-[13px] text-muted-foreground">
                This cannot be undone. Your partner will no longer see this session.
              </p>
              {cancelError && (
                <p className="text-[13px] text-danger">{cancelError}</p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                >
                  Keep session
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling…" : "Yes, cancel"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
