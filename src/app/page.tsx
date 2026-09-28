import { auth } from "@/auth";
import { redirect } from "next/navigation";
import HomeRedirect from "@/components/HomeRedirect";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/shop");
  }
  return <HomeRedirect />;
}
