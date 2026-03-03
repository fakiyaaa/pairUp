"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn, formatDate, formatTime } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const topicSuggestions: Record<string, string[]> = {
  technical: [
    "Data Structures",
    "Algorithms",
    "System Design",
    "Dynamic Programming",
    "Machine Learning",
    "React",
    "Node.js",
    "API Design",
    "Python",
    "SQL",
    "Graphs",
    "Trees",
    "Sorting",
  ],
  behavioral: [
    "Leadership",
    "Conflict Resolution",
    "Teamwork",
    "Failure",
    "Strategy",
    "Communication",
    "Decision Making",
    "Adaptability",
  ],
  case: [
    "Market Sizing",
    "Profitability",
    "Go-to-Market",
    "M&A",
    "Pricing",
    "Growth Strategy",
    "Market Entry",
  ],
  product: [
    "Product Sense",
    "Metrics",
    "Strategy",
    "User Research",
    "Prioritization",
    "Product Design",
    "A/B Testing",
  ],
};

export default function NewPostPage() {
  const router = useRouter();
  const [intent, setIntent] = useState("");
  const [interviewType, setInterviewType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("45");
  const [targetCompany, setTargetCompany] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [slots, setSlots] = useState<
    { id: string; date: string; startTime: string; endTime: string }[]
  >([]);
  const [submitted, setSubmitted] = useState(false);

  const addSlot = () => {
    setSlots((prev) => [
      ...prev,
      { id: String(Date.now()), date: "", startTime: "", endTime: "" },
    ]);
  };

  const updateSlot = (
    id: string,
    field: "date" | "startTime" | "endTime",
    value: string
  ) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const suggestedTopics = interviewType
    ? topicSuggestions[interviewType] || []
    : [];

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight mb-2">
          Post published!
        </h1>
        <p className="text-[14px] text-muted-foreground mb-8 max-w-sm mx-auto">
          Your post is now visible to compatible partners. You&apos;ll be
          notified when someone sends a match request.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/browse">
            <Button variant="secondary">Browse posts</Button>
          </Link>
          <Link href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Dashboard
      </Link>

      <h1 className="text-[28px] font-semibold tracking-tight mb-1">
        Create a new post
      </h1>
      <p className="text-[14px] text-muted-foreground mb-8">
        Fill out the details and we&apos;ll help you find the right match
      </p>

      <div className="flex flex-col gap-6">
        {/* Intent */}
        <div>
          <label className="text-[13px] font-medium text-foreground mb-3 block">
            What are you looking for?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                id: "get",
                label: "Get interviewed",
                desc: "I want to practice",
              },
              {
                id: "give",
                label: "Give interviews",
                desc: "I want to help others",
              },
              {
                id: "both",
                label: "Either role",
                desc: "Happy to swap",
              },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setIntent(option.id)}
                className={cn(
                  "flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all cursor-pointer",
                  intent === option.id
                    ? "border-accent bg-accent-light"
                    : "border-border bg-card hover:border-accent/30"
                )}
              >
                <span className="text-[14px] font-medium">{option.label}</span>
                <span className="text-[12px] text-muted-foreground">
                  {option.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Type & Difficulty */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="type"
            label="Interview type"
            placeholder="Select type"
            options={[
              { value: "technical", label: "Technical" },
              { value: "behavioral", label: "Behavioral" },
              { value: "case", label: "Case Study" },
              { value: "product", label: "Product" },
            ]}
            value={interviewType}
            onChange={(e) => {
              setInterviewType(e.target.value);
              setSelectedTopics([]);
            }}
          />
          <Select
            id="difficulty"
            label="Difficulty level"
            placeholder="Select level"
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          />
        </div>

        {/* Topics */}
        {suggestedTopics.length > 0 && (
          <div>
            <label className="text-[13px] font-medium text-foreground mb-2 block">
              Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={cn(
                    "px-3 py-1.5 text-[13px] font-medium rounded-lg border transition-all cursor-pointer",
                    selectedTopics.includes(topic)
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-accent/30"
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Duration & Company */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            id="duration"
            label="Duration"
            options={[
              { value: "30", label: "30 minutes" },
              { value: "45", label: "45 minutes" },
              { value: "60", label: "60 minutes" },
            ]}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Input
            id="company"
            label="Target company (optional)"
            placeholder="e.g. Google, Stripe"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
          />
        </div>

        {/* Description */}
        <Textarea
          id="description"
          label="Description"
          placeholder="What are you looking for in this session? Any specific areas you'd like to focus on?"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Availability */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[13px] font-medium text-foreground">
              Availability
            </label>
            <Button variant="ghost" size="sm" onClick={addSlot}>
              <Plus className="w-3.5 h-3.5" />
              Add slot
            </Button>
          </div>

          {slots.length === 0 ? (
            <button
              onClick={addSlot}
              className="w-full py-8 border-2 border-dashed border-border rounded-xl text-center hover:border-accent/30 hover:bg-muted/50 transition-all cursor-pointer"
            >
              <Calendar className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">
                Add your available time slots
              </p>
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-xl"
                >
                  <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="date"
                    value={slot.date}
                    onChange={(e) => updateSlot(slot.id, "date", e.target.value)}
                    className="flex-1 bg-white px-3 py-1.5 text-[13px] rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) =>
                      updateSlot(slot.id, "startTime", e.target.value)
                    }
                    className="bg-white px-3 py-1.5 text-[13px] rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                  <span className="text-[13px] text-muted-foreground">to</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) =>
                      updateSlot(slot.id, "endTime", e.target.value)
                    }
                    className="bg-white px-3 py-1.5 text-[13px] rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => removeSlot(slot.id)}
                    className="p-1 rounded-lg hover:bg-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <Link href="/dashboard">
            <Button variant="secondary">Cancel</Button>
          </Link>
          <Button onClick={() => setSubmitted(true)}>
            <Sparkles className="w-4 h-4" />
            Publish post
          </Button>
        </div>
      </div>
    </div>
  );
}
