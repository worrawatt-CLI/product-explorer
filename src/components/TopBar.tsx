"use client";

import { useRouter } from "next/navigation";
import { logout, useAuth } from "@/lib/auth";

type TopBarProps = {
  title: string;
};

export default function TopBar({ title }: TopBarProps) {
  const { session } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="topbar-title">{title}</span>

        {session && (
          <div className="topbar-user">
            <button type="button" onClick={handleLogout}>
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
