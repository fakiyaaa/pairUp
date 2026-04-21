"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
import { calApi } from "@/lib/services/cal";

function CalCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const code = searchParams.get("code");
    console.log("Cal callback URL:", window.location.href);
    console.log("Cal code:", code);
    if (!code) {
      router.replace("/profile?cal=error");
      return;
    }

    calApi
      .exchange(code)
      .then(() => router.replace("/profile?cal=connected"))
      .catch((err) => {
        console.error("Cal exchange error:", err);
        router.replace("/profile?cal=error");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[14px] text-muted-foreground">Connecting Cal.com…</p>
    </div>
  );
}

export default function CalCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[14px] text-muted-foreground">Connecting Cal.com…</p>
      </div>
    }>
      <CalCallback />
    </Suspense>
  );
}
