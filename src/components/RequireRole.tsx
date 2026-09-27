"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { homePath, useAuth, type Role } from "@/lib/auth";

type RequireRoleProps = {
  role: Role;
  children: ReactNode;
};

export default function RequireRole({ role, children }: RequireRoleProps) {
  const { session, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!session) {
      router.replace("/login");
    } else if (session.role !== role) {
      router.replace(homePath(session.role));
    }
  }, [hydrated, session, role, router]);


  if (!hydrated || !session || session.role !== role) {
    return (
      <main className="page">
        <p className="status-box">รอเเปป</p>
      </main>
    );
  }

  return <>{children}</>;
}
