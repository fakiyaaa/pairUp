"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Search,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            PairUp
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[13px] font-medium text-muted-foreground mb-5 tracking-wide uppercase">
            For Minerva students
          </p>
          <h1 className="text-[44px] leading-[1.1] font-bold tracking-tight text-foreground mb-5">
            Practice interviews
            <br />
            with the right people.
          </h1>
          <p className="text-[17px] leading-relaxed text-muted-foreground max-w-md mx-auto mb-10">
            Match by topic, level, and schedule.
            <br />
            No DMs. No back-and-forth.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/signup">
              <Button size="lg">
                Get started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider text-center mb-3">
            How it works
          </p>
          <h2 className="text-[26px] font-bold text-center mb-12 tracking-tight">
            Three steps to a great mock.
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                num: "1",
                title: "Post a request",
                desc: "Pick interview type, topics, difficulty, and your available times.",
              },
              {
                icon: Users,
                num: "2",
                title: "Find a match",
                desc: "Browse compatible partners or wait for someone to request you.",
              },
              {
                icon: Calendar,
                num: "3",
                title: "Lock in & practice",
                desc: "Confirm a slot, get a meeting link, and jump into the session.",
              },
            ].map((item) => (
              <div key={item.num} className="text-center">
                <div className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-4 text-[14px] font-semibold">
                  {item.num}
                </div>
                <h3 className="text-[15px] font-semibold mb-1.5">
                  {item.title}
                </h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
            {[
              {
                title: "Structured matching",
                desc: "Filter by interview type, topics, difficulty, and target company.",
              },
              {
                title: "Timezone-aware scheduling",
                desc: "Availability overlap calculated automatically. Pick a slot, done.",
              },
              {
                title: "Clear expectations",
                desc: "Both sides see the format, focus areas, and prep details upfront.",
              },
              {
                title: "Honest feedback",
                desc: "Structured templates for communication, preparedness, and skill.",
              },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="text-[15px] font-semibold mb-1">{f.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-[24px] font-bold mb-3 tracking-tight">
            Ready to start practicing?
          </h2>
          <p className="text-[14px] text-muted-foreground mb-8">
            Join your classmates on PairUp. Free, always.
          </p>
          <Link href="/signup">
            <Button size="lg">
              Create account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-[12px] text-muted-foreground">
          <span>PairUp</span>
          <span>Minerva University</span>
        </div>
      </footer>
    </div>
  );
}
