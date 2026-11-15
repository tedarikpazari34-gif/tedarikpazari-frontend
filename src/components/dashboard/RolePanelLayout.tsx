import type { ReactNode } from "react";
import BuyerPanelNavigation from "../buyer/BuyerPanelNavigation";
import AdminSidebar from "../admin/AdminSidebar";

type RolePanelLayoutProps = {
  role: "BUYER" | "ADMIN";
  children: ReactNode;
};

export default function RolePanelLayout({
  role,
  children,
}: RolePanelLayoutProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        minWidth: 0,
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      {role === "BUYER" ? <BuyerPanelNavigation /> : <AdminSidebar />}

      <div
        style={{
          flex: "1 1 0",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}
