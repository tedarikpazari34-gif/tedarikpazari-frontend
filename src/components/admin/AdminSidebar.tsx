import { Link, useLocation } from "react-router-dom";

const items = [
  {
    label: "Dashboard",
    path: "/admin",
  },
  {
    label: "Kontrol Merkezi",
    path: "/admin/control-center",
  },
  {
    label: "Şirketler",
    path: "/admin/companies",
  },
  {
    label: "Ürünler",
    path: "/admin/products",
  },
  {
    label: "Payouts",
    path: "/admin/payouts",
  },
  {
    label: "Disputes",
    path: "/admin/disputes",
  },
  {
    label: "Finans",
    path: "/admin/finance",
  },
];

export default function AdminSidebar() {
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
        Admin Panel
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
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
