"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { homePath, useAuth } from "@/lib/auth";

// ใช้สำหรับผู้ดูแลระบบ (client session) เมื่อไม่มี Google session
export default function HomeRedirect() {
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
