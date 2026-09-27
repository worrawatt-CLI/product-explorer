import RequireRole from "@/components/RequireRole";
import TopBar from "@/components/TopBar";
import UserShop from "@/components/UserShop";

export default function ShopPage() {
  return (
    <RequireRole role="user">
      <TopBar title="ร้านค้า" />
      <UserShop />
    </RequireRole>
  );
}
