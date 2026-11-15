import { disconnectSocket } from "../lib/socket";
import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import PanelNavigation, { type PanelMenuGroup } from "./dashboard/PanelNavigation";

export default function SellerLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    disconnectSocket();
    const language = localStorage.getItem("language");
    localStorage.clear();

    if (language) {
      localStorage.setItem("language", language);
    }

    window.location.href = "/login";
  };

  const groups: PanelMenuGroup[] = [
    {
      title: t("sellerLayout.dashboard"),
      icon: "📊",
      items: [
        { label: t("sellerLayout.dashboard"), path: "/seller/dashboard", icon: "📊" },
      ],
    },
    {
      title: t("sellerLayout.myProducts"),
      icon: "📦",
      items: [
        { label: t("sellerLayout.myProducts"), path: "/seller/products", icon: "📦" },
        { label: t("sellerLayout.newProduct"), path: "/seller/products/new", icon: "➕" },
        {
          label: t("panelNavigation.bulkImport"),
          path: "/seller/products/import",
          icon: "📄",
        },
      ],
    },
    {
      title: t("sellerLayout.orders"),
      icon: "🧾",
      items: [
        { label: t("sellerLayout.orders"), path: "/seller/orders", icon: "🧾" },
        ...(import.meta.env.VITE_CHARGEBACK_ENABLED === "true"
          ? [{
              label: t("sellerLayout.chargebacks", { defaultValue: "Harcama İtirazlarım" }),
              path: "/seller/chargebacks",
              icon: "🛡️",
            }]
          : []),
      ],
    },
    {
      title: t("panelNavigation.earnings"),
      icon: "💳",
      items: [
        { label: t("panelNavigation.earnings"), path: "/wallet", icon: "💳" },
      ],
    },
    {
      title: t("panelNavigation.companyProfile"),
      icon: "🏢",
      items: [
        { label: t("panelNavigation.companyProfile"), path: "/seller/profile", icon: "🏢" },
        { label: t("accountSecurity.title"), path: "/seller/security", icon: "🔒" },
        { label: t("panelNavigation.messages"), path: "/chat", icon: "💬" },
        { label: t("panelNavigation.notifications"), path: "/notifications", icon: "🔔" },
      ],
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

        <PanelNavigation groups={groups} title={t("sellerLayout.panelTitle")} />

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

        {isMobile && (
          <div style={{ marginBottom: 18 }}>
            <button
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="seller-mobile-navigation"
              onClick={() => setMobileMenuOpen((open) => !open)}
              style={{
                background: "#0d9488",
                color: "#ffffff",
                border: 0,
                borderRadius: 10,
                padding: "12px 16px",
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}
            >
              {mobileMenuOpen ? t("panelNavigation.closeMenu") : `☰ ${t("panelNavigation.sellerMenu")}`}
            </button>
            {mobileMenuOpen && (
              <div id="seller-mobile-navigation" style={{ marginTop: 12 }}>
                <PanelNavigation
                  groups={groups}
                  title={t("sellerLayout.panelTitle")}
                />
                <button
                  type="button"
                  onClick={logout}
                  style={{ ...logoutButton, width: "100%", marginTop: 12 }}
                >
                  {t("sellerLayout.logout")}
                </button>
              </div>
            )}
          </div>
        )}
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
  background: "#ffffff",
  color: "#0f172a",
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
  background: "#0d9488",
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
  color: "#64748b",
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
  background: "#ccfbf1",
  color: "#0d9488",
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