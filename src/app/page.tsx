"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homePath, useAuth } from "@/lib/auth";

export default function Home() {
  const { session, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    router.replace(session ? homePath(session.role) : "/login");
  }, [hydrated, session, router]);

  return (
    <main className="page">
      <p className="status-box">กำลังโหลด...</p>
    </main>
  );
}
