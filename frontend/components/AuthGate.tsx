"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return (
      <main className="auth-page">
        <section className="card auth-card stack">
          <p className="eyebrow">ForeSee</p>
          <h1>Checking your session...</h1>
          <div className="progress"><span style={{ width: "72%" }} /></div>
        </section>
      </main>
    );
  }

  if (!user) return null;

  return children;
}
