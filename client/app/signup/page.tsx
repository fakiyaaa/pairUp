"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import { ArrowLeft, ArrowRight, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { authApi } from "@/lib/services/auth";

const timezones = [
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Seoul", label: "Seoul (KST)" },
  { value: "America/Sao_Paulo", label: "Sao Paulo (BRT)" },
];

const interviewTypes = [
  { id: "technical", label: "Technical" },
  { id: "behavioral", label: "Behavioral" },
  { id: "case", label: "Case Study" },
  { id: "product", label: "Product" },
];

const topicOptions = [
  "Data Structures",
  "Algorithms",
  "System Design",
  "Dynamic Programming",
  "Machine Learning",
  "Product Sense",
  "Metrics",
  "Strategy",
  "Market Sizing",
  "Profitability",
  "Go-to-Market",
  "Leadership",
  "Conflict Resolution",
  "React",
  "Node.js",
  "API Design",
  "Python",
  "SQL",
  "Statistics",
  "Brain Teasers",
];

const roles: { id: UserRole; label: string; description: string }[] = [
  {
    id: "interviewee",
    label: "I want to practice",
    description: "Find interviewers who can run mock sessions for you",
  },
  {
    id: "interviewer",
    label: "I can run interviews",
    description: "Help peers prep by conducting structured mock interviews",
  },
  {
    id: "both",
    label: "Both",
    description: "Give and get — swap roles depending on the session",
  },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timezone, setTimezone] = useState("");

  // Step 2
  const [role, setRole] = useState<UserRole | "">("");

  // Step 3
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [experience, setExperience] = useState("");

  // Step 4
  const [schedulingUrl, setSchedulingUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleType = (id: string) =>
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const toggleTopic = (topic: string) =>
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );

  async function handleSignup(withSchedulingUrl: boolean) {
    setError("");
    setLoading(true);
    try {
      await authApi.signup({
        full_name: name,
        email,
        password,
        timezone,
        experience: experience || undefined,
        cal_com_link: withSchedulingUrl && schedulingUrl ? schedulingUrl : undefined,
      });
      window.location.assign("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-foreground" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Account */}
        {step === 1 && (
          <>
            <h1 className="text-[28px] font-bold tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-[14px] text-muted-foreground mb-8">
              Use your Minerva email to get started
            </p>
            <div className="flex flex-col gap-4">
              <Input
                id="name"
                label="Full name"
                placeholder="Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                id="email"
                label="Minerva email"
                type="email"
                placeholder="you@uni.minerva.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                hint="Must be a @uni.minerva.edu address"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Select
                id="timezone"
                label="Timezone"
                placeholder="Select your timezone"
                options={timezones}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
              <Button size="lg" className="w-full mt-2" onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[13px] text-muted-foreground text-center mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* Step 2 — Role */}
        {step === 2 && (
          <>
            <h1 className="text-[28px] font-bold tracking-tight mb-2">
              What's your role?
            </h1>
            <p className="text-[14px] text-muted-foreground mb-8">
              You can change this any time in your profile
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "text-left px-4 py-4 rounded-xl border transition-all cursor-pointer",
                    role === r.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:border-foreground/30"
                  )}
                >
                  <p
                    className={cn(
                      "text-[14px] font-semibold mb-0.5",
                      role === r.id ? "text-background" : "text-foreground"
                    )}
                  >
                    {r.label}
                  </p>
                  <p
                    className={cn(
                      "text-[13px]",
                      role === r.id
                        ? "text-background/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {r.description}
                  </p>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={() => role && setStep(3)}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* Step 3 — Preferences */}
        {step === 3 && (
          <>
            <h1 className="text-[28px] font-bold tracking-tight mb-2">
              Your preferences
            </h1>
            <p className="text-[14px] text-muted-foreground mb-8">
              Select the interview types and topics you care about
            </p>
            <div className="flex flex-col gap-6">
              <div>
                <label className="text-[13px] font-medium text-foreground mb-3 block">
                  Interview types
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interviewTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={cn(
                        "px-4 py-3 text-[14px] font-medium rounded-xl border transition-all cursor-pointer",
                        selectedTypes.includes(type.id)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-foreground hover:border-foreground/30"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                id="experience"
                label="Experience level"
                placeholder="Select your level"
                options={[
                  { value: "beginner", label: "Beginner — just starting prep" },
                  { value: "intermediate", label: "Intermediate — some practice" },
                  { value: "advanced", label: "Advanced — extensive experience" },
                ]}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />

              <div>
                <label className="text-[13px] font-medium text-foreground mb-3 block">
                  Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicOptions.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => toggleTopic(topic)}
                      className={cn(
                        "px-3 py-1.5 text-[13px] font-medium rounded-lg border transition-all cursor-pointer",
                        selectedTopics.includes(topic)
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      )}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <Button variant="secondary" size="lg" className="flex-1" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setStep(4)}>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step 4 — Scheduling link */}
        {step === 4 && (
          <>
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-6">
              <Calendar className="w-5 h-5 text-muted-foreground" />
            </div>
            <h1 className="text-[28px] font-bold tracking-tight mb-2">
              Add your scheduling link
            </h1>
            <p className="text-[14px] text-muted-foreground mb-8">
              Paste your Calendly or cal.com link so matched partners can book
              time directly — no back-and-forth needed.
            </p>

            <div className="flex flex-col gap-4">
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

              <p className="text-[12px] text-muted-foreground">
                Works with Calendly, cal.com, or any direct booking link.
              </p>

              {error && (
                <p className="text-[13px] text-red-500">{error}</p>
              )}
              <Button
                size="lg"
                className="w-full mt-2"
                onClick={() => handleSignup(true)}
                disabled={loading}
              >
                {loading ? "Creating account…" : "Complete setup"}
              </Button>

              <button
                onClick={() => handleSignup(false)}
                disabled={loading}
                className="text-[13px] text-muted-foreground hover:text-foreground text-center transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            </div>

            <button
              onClick={() => setStep(3)}
              className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
