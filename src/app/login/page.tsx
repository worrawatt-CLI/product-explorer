import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  // ถ้ามี session ของ Google อยู่แล้ว เข้าใช้งานในสิทธิ์ผู้ใช้ทั่วไป (ไปหน้าร้านค้า)
  const session = await auth();
  if (session?.user) {
    redirect("/shop");
  }

  // Server Action: เข้าสู่ระบบด้วย Google แล้วกลับไปหน้าร้านค้า (/shop) = ตำแหน่งผู้ใช้เท่านั้น
  async function googleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/shop" });
  }

  return <LoginForm googleSignIn={googleSignIn} />;
}
