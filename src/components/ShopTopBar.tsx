import { signOut } from "@/auth";

type ShopTopBarProps = {
  // ชื่อผู้ใช้จากบัญชี Google
  userName: string;
};

// แถบบนของหน้าร้านค้า แสดงคำทักทายและปุ่มออกจากระบบ (Google signOut)
export default function ShopTopBar({ userName }: ShopTopBarProps) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <span className="topbar-title">ร้านค้า</span>

        <div className="topbar-user">
          <span className="topbar-greeting">sawadee {userName}</span>
          <form action={handleSignOut}>
            <button type="submit">ออกจากระบบ</button>
          </form>
        </div>
      </div>
    </header>
  );
}
