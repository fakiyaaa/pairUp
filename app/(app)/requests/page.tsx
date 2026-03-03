"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { currentUser, matchRequests } from "@/lib/mock-data";
import {
  cn,
  difficultyLabels,
  formatDate,
  formatTime,
  interviewTypeLabels,
  timeAgo,
} from "@/lib/utils";
import { Check, Clock, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const tabs = ["Incoming", "Sent"];

export default function RequestsPage() {
  const [active, setActive] = useState("Incoming");
  const [actioned, setActioned] = useState<
    Record<string, "accepted" | "declined">
  >({});

  const incoming = matchRequests.filter(
    (r) => r.requester.id !== currentUser.id
  );
  const outgoing = matchRequests.filter(
    (r) => r.requester.id === currentUser.id
  );
  const list = active === "Incoming" ? incoming : outgoing;

  return (
    <div>
      <h1 className="text-[28px] font-semibold tracking-tight mb-6">Requests</h1>

      <div className="flex gap-1 mb-8">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={cn(
              "px-3 py-1 text-[13px] font-medium rounded-lg transition-colors cursor-pointer",
              active === t
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[14px] text-muted-foreground mb-4">
            {active === "Incoming"
              ? "No incoming requests."
              : "You haven't sent any requests yet."}
          </p>
          {active === "Sent" && (
            <Link href="/browse">
              <Button variant="secondary" size="sm">
                Browse posts
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {list.map((req) => {
            const isIncoming = active === "Incoming";
            const person = isIncoming ? req.requester : req.post.author;
            const action = actioned[req.id];

            return (
              <div key={req.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <Avatar name={person.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[14px] font-medium">{person.name}</p>
                      <span className="text-[12px] text-muted-foreground">
                        {timeAgo(req.createdAt)}
                      </span>
                    </div>

                    <p className="text-[13px] text-muted-foreground mb-2">
                      {interviewTypeLabels[req.post.interviewType]} &middot;{" "}
                      {difficultyLabels[req.post.difficulty]} &middot;{" "}
                      {req.post.duration}m
                    </p>

                    {req.message && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 bg-muted rounded-xl px-4 py-3">
                        {req.message}
                      </p>
                    )}

                    {req.proposedSlots.length > 0 && (
                      <p className="text-[12px] text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {req.proposedSlots.map((slot) => (
                          <span key={slot.id}>
                            {formatDate(slot.date)},{" "}
                            {formatTime(slot.startTime)} –{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        ))}
                      </p>
                    )}

                    {isIncoming && !action && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            setActioned((p) => ({
                              ...p,
                              [req.id]: "accepted",
                            }))
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setActioned((p) => ({
                              ...p,
                              [req.id]: "declined",
                            }))
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {action === "accepted" && (
                      <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Accepted
                      </p>
                    )}

                    {action === "declined" && (
                      <p className="text-[13px] text-muted-foreground flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        Declined
                      </p>
                    )}

                    {!isIncoming && (
                      <span className="text-[12px] text-muted-foreground">
                        {req.status === "pending" ? "Waiting for response" : req.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
