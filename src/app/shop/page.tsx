import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ShopTopBar from "@/components/ShopTopBar";
import UserShop from "@/components/UserShop";

export default async function ShopPage() {
  // ปกป้องหน้าร้านค้าฝั่ง server: ต้องมี session ของ Google เท่านั้น (ตำแหน่งผู้ใช้)
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <ShopTopBar userName={session.user.name ?? "ผู้ใช้งาน"} />
      <UserShop />
    </>
  );
}
