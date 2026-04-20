"use client";

import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/lib/context/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/sessions", label: "Sessions" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

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
            <Link
              href="/profile"
              className="p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar name={user.full_name} size="sm" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}