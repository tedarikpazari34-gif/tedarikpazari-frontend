import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { disconnectSocket, getSocket } from "../lib/socket";
import { enablePushNotifications } from "../pushNotifications";

type NavItem = {
  labelKey: string;
  to: string;
};

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

const publicLinks: NavItem[] = [
  { labelKey: "common.home", to: "/" },
  { labelKey: "common.products", to: "/products" },
];

const buyerLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/buyer/dashboard" },
  { labelKey: "common.home", to: "/" },
  { labelKey: "common.products", to: "/products" },
  { labelKey: "common.myQuotes", to: "/tekliflerim" },
  { labelKey: "common.myOrders", to: "/buyer/orders" },
  { labelKey: "common.shippingQuotes", to: "/buyer/shipping-quotes" },
  { labelKey: "common.favorites", to: "/favorites" },
  { labelKey: "common.messages", to: "/chat" },
  { labelKey: "common.wallet", to: "/wallet" },
  { labelKey: "common.companyVerification", to: "/company/verification" },
];

const sellerLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/seller/dashboard" },
  { labelKey: "common.incomingRequests", to: "/seller/rfqs" },
  { labelKey: "common.myQuotes", to: "/seller/quotes" },
  { labelKey: "common.myOrders", to: "/seller/orders" },
  { labelKey: "common.myProducts", to: "/seller/products" },
  { labelKey: "common.companyProfile", to: "/seller/profile" },
  { labelKey: "common.wallet", to: "/wallet" },
  { labelKey: "common.messages", to: "/chat" },
  { labelKey: "common.companyVerification", to: "/company/verification" },
];

const logisticsLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/logistics/dashboard" },
  { labelKey: "common.openLoads", to: "/logistics/shipping" },
  { labelKey: "common.myShipments", to: "/logistics/orders" },
  { labelKey: "common.messages", to: "/chat" },
];

const adminLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/admin" },
  { labelKey: "common.companies", to: "/admin/companies" },
  { labelKey: "common.verificationRequests", to: "/admin/verification-requests" },
  { labelKey: "common.productManagement", to: "/admin/products" },
  { labelKey: "common.payments", to: "/admin/payouts" },
  { labelKey: "common.disputes", to: "/admin/disputes" },
  { labelKey: "common.finance", to: "/admin/finance" },
  { labelKey: "common.chatModeration", to: "/admin/chat-moderation" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted",
  );
  const [pushLoading, setPushLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const roleLinks: NavItem[] =
    role === "BUYER"
      ? buyerLinks
      : role === "SELLER"
        ? sellerLinks
        : role === "LOGISTICS"
          ? logisticsLinks
          : role === "ADMIN"
            ? adminLinks
            : publicLinks;

  const mobileSectionTitle =
    role === "BUYER"
      ? t("common.buyerPanel")
      : role === "SELLER"
        ? t("common.sellerPanel")
        : role === "LOGISTICS"
          ? t("common.logisticsPanel")
          : role === "ADMIN"
            ? t("common.adminPanel")
            : t("common.menu");

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (!token) {
          setUnreadCount(0);
          return;
        }

        const res = await fetch(`${API}/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setUnreadCount(0);
          return;
        }

        setUnreadCount(Number(data?.count || 0));
      } catch (err) {
        console.error("NOTIFICATION COUNT ERROR:", err);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();

    const intervalId = window.setInterval(loadUnreadCount, 30000);

    window.addEventListener("storage", loadUnreadCount);
    window.addEventListener(
      "notifications-changed",
      loadUnreadCount as EventListener,
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", loadUnreadCount);
      window.removeEventListener(
        "notifications-changed",
        loadUnreadCount as EventListener,
      );
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket();

    const handleNewNotification = () => {
      setUnreadCount((current) => current + 1);

      window.dispatchEvent(new Event("notifications-changed"));
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    enablePushNotifications()
      .then(() => {
        setPushEnabled(true);
      })
      .catch((err) => {
        console.error("AUTO PUSH TOKEN ERROR:", err);
      });
  }, [token]);

  const enablePush = async () => {
    try {
      setPushLoading(true);
      await enablePushNotifications();
      setPushEnabled(true);
      alert(t("navbar.pushEnabledSuccess"));
    } catch (err: any) {
      alert(err?.message || t("navbar.pushEnableFailed"));
    } finally {
      setPushLoading(false);
    }
  };

  const logout = () => {
    disconnectSocket();

    const language = localStorage.getItem("language");
    localStorage.clear();

    if (language) {
      localStorage.setItem("language", language);
    }

    setUnreadCount(0);
    setOpen(false);
    navigate("/login");
  };

  return (
    <header style={headerStyle}>
      <div style={barStyle}>
        <Link to="/" style={brandStyle} onClick={() => setOpen(false)}>
          <span style={brandIconStyle}>TP</span>

          <span>
            TEDARİK PAZARI
            <small style={brandSubStyle}>{t("common.marketplace")}</small>
          </span>
        </Link>

        <nav style={desktopNavStyle}>
          <NavGroup items={roleLinks} />

          <LanguageSwitcher />

          <Link to="/notifications" style={bellStyle}>
            🔔
            {unreadCount > 0 && (
              <span style={badgeStyle}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {token && !pushEnabled && (
            <button
              type="button"
              onClick={enablePush}
              disabled={pushLoading}
              style={pushButtonStyle}
            >
              {pushLoading ? t("common.enabling") : t("common.enableNotifications")}
            </button>
          )}

          {token ? (
            <button onClick={logout} style={logoutButtonStyle}>
              {t("common.logout")}
            </button>
          ) : (
            <div style={authGroupStyle}>
              <Link to="/login" style={loginButtonStyle}>
                {t("common.login")}
              </Link>

              <Link to="/register" style={registerButtonStyle}>
                {t("common.register")}
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={mobileButtonStyle}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div style={mobileMenuStyle}>
          <MobileSection
            title={mobileSectionTitle}
            items={roleLinks}
            close={() => setOpen(false)}
          />

          <LanguageSwitcher mobile />

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            style={mobileNotificationStyle}
          >
            🔔 {t("common.notifications")}
            {unreadCount > 0 && (
              <span style={mobileBadgeStyle}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {token ? (
            <button onClick={logout} style={mobileLogoutStyle}>
              {t("common.logout")}
            </button>
          ) : (
            <div style={mobileAuthStyle}>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={loginButtonStyle}
              >
                {t("common.login")}
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                style={registerButtonStyle}
              >
                {t("common.register")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "tr";

  const changeLanguage = (language: "tr" | "en") => {
    i18n.changeLanguage(language);
  };

  return (
    <div style={mobile ? mobileLanguageStyle : languageStyle}>
      <button
        type="button"
        onClick={() => changeLanguage("tr")}
        style={{
          ...languageButtonStyle,
          ...(currentLanguage.startsWith("tr")
            ? activeLanguageButtonStyle
            : {}),
        }}
      >
        TR
      </button>

      <span style={languageDividerStyle}>|</span>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        style={{
          ...languageButtonStyle,
          ...(currentLanguage.startsWith("en")
            ? activeLanguageButtonStyle
            : {}),
        }}
      >
        EN
      </button>
    </div>
  );
}

function NavGroup({ items }: { items: NavItem[] }) {
  const { t } = useTranslation();

  return (
    <div style={navGroupStyle}>
      {items.map((item) => (
        <Link key={item.to} to={item.to} style={linkStyle}>
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}

function MobileSection({
  title,
  items,
  close,
}: {
  title: string;
  items: NavItem[];
  close: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div style={mobileSectionStyle}>
      <div style={mobileTitleStyle}>{title}</div>

      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={close}
          style={mobileLinkStyle}
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(15, 23, 42, 0.94)",
  backdropFilter: "blur(16px)",
  borderBottom: "2px solid rgba(255,255,255,0.14)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
};

const barStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "14px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "white",
  textDecoration: "none",
  fontWeight: 900,
};

const brandIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: "linear-gradient(135deg, #38bdf8, #2563eb)",
  display: "grid",
  placeItems: "center",
  color: "white",
  fontSize: 13,
  fontWeight: 900,
};

const brandSubStyle: React.CSSProperties = {
  display: "block",
  marginTop: 3,
  color: "#94a3b8",
  fontSize: 11,
  fontWeight: 700,
};

const desktopNavStyle: React.CSSProperties = {
  display: window.innerWidth < 980 ? "none" : "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const navGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const linkStyle: React.CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 13,
  padding: "9px 10px",
  borderRadius: 10,
};

const languageStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 8px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
};

const mobileLanguageStyle: React.CSSProperties = {
  ...languageStyle,
  justifyContent: "center",
  padding: 10,
};

const languageButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#94a3b8",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 900,
  padding: "3px 4px",
};

const activeLanguageButtonStyle: React.CSSProperties = {
  color: "#38bdf8",
};

const languageDividerStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 12,
};

const bellStyle: React.CSSProperties = {
  position: "relative",
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontSize: 18,
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: -6,
  right: -6,
  minWidth: 20,
  height: 20,
  borderRadius: 999,
  background: "#ef4444",
  color: "white",
  fontSize: 11,
  fontWeight: 900,
  display: "grid",
  placeItems: "center",
  padding: "0 5px",
};

const authGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const loginButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 13,
};

const registerButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#22c55e",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 13,
};

const pushButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: 10,
  padding: "9px 12px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};

const logoutButtonStyle: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 13,
};

const mobileButtonStyle: React.CSSProperties = {
  display: window.innerWidth < 980 ? "block" : "none",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  width: 42,
  height: 42,
  borderRadius: 12,
  fontSize: 20,
  cursor: "pointer",
};

const mobileMenuStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "0 20px 18px",
  display: "grid",
  gap: 12,
};

const mobileSectionStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 8,
};

const mobileTitleStyle: React.CSSProperties = {
  color: "#38bdf8",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 4,
};

const mobileLinkStyle: React.CSSProperties = {
  color: "#e2e8f0",
  textDecoration: "none",
  fontWeight: 800,
  padding: "9px 0",
};

const mobileNotificationStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 14,
  color: "#e2e8f0",
  textDecoration: "none",
  fontWeight: 900,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const mobileBadgeStyle: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  borderRadius: 999,
  padding: "3px 8px",
  fontSize: 12,
  fontWeight: 900,
};

const mobileAuthStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const mobileLogoutStyle: React.CSSProperties = {
  ...logoutButtonStyle,
  width: "100%",
};
