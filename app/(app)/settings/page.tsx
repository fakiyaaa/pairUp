"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Bell,
  Calendar,
  Globe,
  Link as LinkIcon,
  Lock,
  Mail,
  Shield,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [matchNotifs, setMatchNotifs] = useState(true);
  const [reminderNotifs, setReminderNotifs] = useState(true);
  const [feedbackNotifs, setFeedbackNotifs] = useState(true);
  const [defaultDuration, setDefaultDuration] = useState("45");
  const [calendarIntegration, setCalendarIntegration] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-[14px] text-muted-foreground">
          Manage your account preferences
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Notifications */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold">Notifications</h2>
              <p className="text-[13px] text-muted-foreground">
                Choose what you get notified about
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {[
              {
                label: "Email notifications",
                desc: "Receive email for important updates",
                value: emailNotifs,
                onChange: setEmailNotifs,
              },
              {
                label: "Match requests",
                desc: "When someone sends you a match request",
                value: matchNotifs,
                onChange: setMatchNotifs,
              },
              {
                label: "Session reminders",
                desc: "Reminder 24h and 1h before sessions",
                value: reminderNotifs,
                onChange: setReminderNotifs,
              },
              {
                label: "Feedback received",
                desc: "When your partner leaves feedback",
                value: feedbackNotifs,
                onChange: setFeedbackNotifs,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-[14px] font-medium">{item.label}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
                <button
                  onClick={() => item.onChange(!item.value)}
                  className={cn(
                    "w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer relative",
                    item.value ? "bg-accent" : "bg-border"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200",
                      item.value ? "translate-x-5.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Session defaults */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Calendar className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold">Session defaults</h2>
              <p className="text-[13px] text-muted-foreground">
                Default settings for new sessions
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Select
              id="duration"
              label="Default session duration"
              options={[
                { value: "30", label: "30 minutes" },
                { value: "45", label: "45 minutes" },
                { value: "60", label: "60 minutes" },
              ]}
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(e.target.value)}
            />

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-medium">
                  Google Calendar integration
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Auto-create calendar events for confirmed sessions
                </p>
              </div>
              <button
                onClick={() => setCalendarIntegration(!calendarIntegration)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer relative",
                  calendarIntegration ? "bg-accent" : "bg-border"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform duration-200",
                    calendarIntegration
                      ? "translate-x-5.5"
                      : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card padding="lg">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-accent" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold">Security</h2>
              <p className="text-[13px] text-muted-foreground">
                Manage your account security
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-medium">Change password</p>
                <p className="text-[12px] text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-[14px] font-medium">
                  Connected accounts
                </p>
                <p className="text-[12px] text-muted-foreground">
                  Google, Zoom integrations
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Manage
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger zone */}
        <Card padding="lg" className="border-danger/20">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-danger-light flex items-center justify-center">
              <Trash2 className="w-4.5 h-4.5 text-danger" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-danger">
                Danger zone
              </h2>
              <p className="text-[13px] text-muted-foreground">
                Irreversible actions
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm">
            Delete account
          </Button>
        </Card>
      </div>
    </div>
  );
}
