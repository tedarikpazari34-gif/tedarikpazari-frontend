import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const items = [
  {
    labelKey: "adminSidebar.dashboard",
    path: "/admin",
  },
  {
    labelKey: "adminSidebar.controlCenter",
    path: "/admin/control-center",
  },
  {
    labelKey: "adminSidebar.companies",
    path: "/admin/companies",
  },
  {
    labelKey: "adminSidebar.products",
    path: "/admin/products",
  },
  {
    labelKey: "adminSidebar.payouts",
    path: "/admin/payouts",
  },
  {
    labelKey: "adminSidebar.disputes",
    path: "/admin/disputes",
  },
  {
    labelKey: "adminSidebar.finance",
    path: "/admin/finance",
  },
];

export default function AdminSidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div
      style={{
        width: 260,
        minHeight: "100vh",
        background: "#111827",
        padding: 24,
        color: "#fff",
      }}
    >
      <h2
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 40,
        }}
      >
        {t("adminSidebar.panel")}
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {items.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                textDecoration: "none",
                background: active ? "#2563eb" : "transparent",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
