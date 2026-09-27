import ProductExplorer from "@/components/ProductExplorer";
import RequireRole from "@/components/RequireRole";
import TopBar from "@/components/TopBar";

export default function AdminPage() {
  return (
    <RequireRole role="admin">
      <TopBar title="ผู้ดูแลระบบ" />
      <ProductExplorer />
    </RequireRole>
  );
}
