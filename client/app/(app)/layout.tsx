"use client";

import { Avatar } from "@/components/ui/avatar";
import { currentUser, notifications } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/sessions", label: "Sessions" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-[15px] font-bold tracking-tight"
            >
              PairUp
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1 text-[13px] font-medium rounded-lg transition-colors",
                    pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href))
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-danger rounded-full" />
                )}
              </button>

              {showNotifs && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifs(false)}
                  />
                  <div className="absolute right-0 top-10 w-72 bg-card rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.04)] z-50 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-[13px] font-semibold">Notifications</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.actionUrl || "#"}
                          onClick={() => setShowNotifs(false)}
                          className={cn(
                            "block px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0",
                            !n.read && "bg-muted/50"
                          )}
                        >
                          <p className="text-[13px] font-medium">{n.title}</p>
                          <p className="text-[12px] text-muted-foreground">
                            {n.message}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/profile"
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar name={currentUser.name} size="sm" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
