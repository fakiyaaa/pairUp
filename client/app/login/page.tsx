"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "@/lib/services/auth";
import { useAuth } from "@/lib/context/auth";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        <h1 className="text-[28px] font-bold tracking-tight mb-2">
          Welcome back
        </h1>
        <p className="text-[14px] text-muted-foreground mb-8">
          Sign in to your PairUp account
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setLoading(true);
            try {
              const { user } = await authApi.login(email, password);
              setUser(user);
              router.push("/dashboard");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed");
            } finally {
              setLoading(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@uni.minerva.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-[13px] text-foreground hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <p className="text-[13px] text-red-500">{error}</p>
          )}
          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-[13px] text-muted-foreground text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-foreground hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
