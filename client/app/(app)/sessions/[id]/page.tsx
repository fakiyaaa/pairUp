"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/context/auth";
import { sessionsApi, type ApiSession } from "@/lib/services/sessions";
import { formatDate, formatTime, interviewTypeLabels } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Video,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [session, setSession] = useState<ApiSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  if (loading) {
    return <p className="text-[14px] text-muted-foreground">Loading…</p>;
  }

  if (notFound || !session) {
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
  const partnerName = isInterviewer ? session.interviewee_name : session.interviewer_name;
  const partnerBio = isInterviewer ? session.interviewee_bio : session.interviewer_bio;
  const partnerTimezone = isInterviewer ? session.interviewee_timezone : session.interviewer_timezone;
  const partnerCalLink = isInterviewer ? session.interviewee_cal_com_link : session.interviewer_cal_com_link;
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
              ? (interviewTypeLabels[session.interview_type] ?? session.interview_type)
              : "Interview"}{" "}
            with {partnerName}
          </h1>
          <p className="text-[14px] text-muted-foreground">
            {formatDate(session.scheduled_at)} at{" "}
            {formatTime(
              `${scheduled.getHours()}:${String(scheduled.getMinutes()).padStart(2, "0")}`,
            )}
          </p>
        </div>
      </div>

      {/* Join banner */}
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

          {partnerCalLink && (
            canReschedule ? (
              <a
                href={partnerCalLink}
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
            <p className="text-muted-foreground text-[12px] mb-0.5">Your role</p>
            <p className="font-medium">
              {isInterviewer ? "Interviewer" : "Interviewee"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-[12px] mb-0.5">Status</p>
            <p className="font-medium capitalize">{session.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-[12px] mb-0.5">
              Partner timezone
            </p>
            <p className="font-medium">{partnerTimezone}</p>
          </div>
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
      {session.feedback && (
        <section className="mb-8">
          <h2 className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Feedback
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StarRating value={session.feedback.rating} readonly size="sm" />
              <span className="text-[13px] text-muted-foreground">
                from {session.feedback.fromUser.name}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Communication", value: session.feedback.communication },
                { label: "Preparedness", value: session.feedback.preparedness },
                { label: "Technical", value: session.feedback.technicalSkill },
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

            {session.feedback.strengths && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Strengths
                </p>
                <p className="text-[14px] leading-relaxed">
                  {session.feedback.strengths}
                </p>
              </div>
            )}
            {session.feedback.improvements && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Improvements
                </p>
                <p className="text-[14px] leading-relaxed">
                  {session.feedback.improvements}
                </p>
              </div>
            )}
            {session.feedback.notes && (
              <div>
                <p className="text-[12px] font-medium text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-[14px] leading-relaxed">
                  {session.feedback.notes}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Feedback form */}
      {session.status === "completed" && !session.feedback && !submitted && (
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
                <div>
                  <label className="text-[13px] font-medium block mb-2">
                    Overall
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      Communication
                    </label>
                    <StarRating
                      value={communication}
                      onChange={setCommunication}
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      Preparedness
                    </label>
                    <StarRating
                      value={preparedness}
                      onChange={setPreparedness}
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-muted-foreground block mb-1.5">
                      Technical
                    </label>
                    <StarRating
                      value={technicalSkill}
                      onChange={setTechnicalSkill}
                      size="sm"
                    />
                  </div>
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
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setSubmitted(true)}>Submit</Button>
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
          <button className="text-[13px] text-danger hover:underline cursor-pointer">
            Cancel session
          </button>
        </div>
      )}
    </div>
  );
}
