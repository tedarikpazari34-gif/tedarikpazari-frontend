import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

export default function SellerLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { t } = useTranslation();
  const path = window.location.pathname;
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    const language = localStorage.getItem("language");
    localStorage.clear();

    if (language) {
      localStorage.setItem("language", language);
    }

    window.location.href = "/login";
  };

  const menu = [
    {
      label: t("sellerLayout.dashboard"),
      href: "/seller/dashboard",
      icon: "📊",
    },
    {
      label: t("sellerLayout.myProducts"),
      href: "/seller/products",
      icon: "📦",
    },
    {
      label: t("sellerLayout.newProduct"),
      href: "/seller/products/new",
      icon: "➕",
    },
    {
      label: t("sellerLayout.incomingRequests"),
      href: "/seller/rfqs",
      icon: "📩",
    },
    {
      label: t("sellerLayout.myQuotes"),
      href: "/seller/quotes",
      icon: "💬",
    },
    {
      label: t("sellerLayout.orders"),
      href: "/seller/orders",
      icon: "🧾",
    },
  ];

  return (
    <div
      style={{
        ...layout,
        minHeight: isMobile ? "auto" : "100vh",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {!isMobile && <aside style={sidebar}>
        <div style={brand}>
          <div style={brandIcon}>T</div>
          <div>
            <div style={brandText}>{t("sellerLayout.brand")}</div>
            <div style={brandSub}>{t("sellerLayout.panelTitle")}</div>
          </div>
        </div>

        <nav style={menuWrap}>
          {menu.map((item) => {
            const active = path === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  ...menuItem,
                  ...(active ? activeMenuItem : {}),
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <button onClick={logout} style={logoutButton}>
          {t("sellerLayout.logout")}
        </button>
      </aside>}

      <main
        style={{
          ...main,
          width: isMobile ? "100%" : undefined,
          minWidth: 0,
          padding: isMobile ? "18px 16px 110px" : 36,
          boxSizing: "border-box",
        }}
      >
        <header
          style={{
            ...topbar,
            alignItems: isMobile ? "flex-start" : "center",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? 12 : undefined,
            marginBottom: isMobile ? 18 : 28,
          }}
        >
          <div>
            <h1
              style={{
                ...pageTitle,
                fontSize: isMobile ? 24 : 32,
              }}
            >
              {title || t("sellerLayout.panelTitle")}
            </h1>
            <p style={pageSub}>{t("sellerLayout.subtitle")}</p>
          </div>

          <div
            style={{
              ...profileBox,
              display: isMobile ? "none" : "flex",
            }}
          >
            <div style={avatar}>S</div>
            <div>
              <div style={profileName}>{t("sellerLayout.sellerAccount")}</div>
              <div style={profileRole}>{t("sellerLayout.sellerRole")}</div>
            </div>
          </div>
        </header>

        <section>{children}</section>
      </main>
    </div>
  );
}

const layout: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  background: "#f1f5f9",
};

const sidebar: CSSProperties = {
  width: 260,
  background: "#0f172a",
  color: "white",
  padding: 24,
  display: "flex",
  flexDirection: "column",
};

const brand: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 36,
};

const brandIcon: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: 20,
};

const brandText: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
};

const brandSub: CSSProperties = {
  fontSize: 12,
  color: "#94a3b8",
};

const menuWrap: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const menuItem: CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  padding: "12px 14px",
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 700,
  fontSize: 14,
};

const activeMenuItem: CSSProperties = {
  background: "#2563eb",
  color: "white",
};

const logoutButton: CSSProperties = {
  marginTop: "auto",
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 800,
  cursor: "pointer",
};

const main: CSSProperties = {
  flex: 1,
  padding: 36,
};

const topbar: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 28,
};

const pageTitle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 900,
  color: "#0f172a",
};

const pageSub: CSSProperties = {
  marginTop: 6,
  color: "#64748b",
};

const profileBox: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "white",
  padding: "10px 14px",
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
};

const avatar: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  background: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
};

const profileName: CSSProperties = {
  fontWeight: 800,
  color: "#0f172a",
};

const profileRole: CSSProperties = {
  fontSize: 12,
  color: "#64748b",
};