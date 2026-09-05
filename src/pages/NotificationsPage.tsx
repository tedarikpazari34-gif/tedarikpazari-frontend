import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type Notification = {
  id: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

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

  const navigate = useNavigate();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = items.filter((item) => !item.isRead).length;

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/notifications/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isRead: true } : item
        )
      );

      window.dispatchEvent(new Event("notifications-changed"));
    } catch (err) {
      console.error(err);
    }
  };
  const openNotification = async (item: Notification) => {
    if (!item.isRead) {
      await markRead(item.id);
    }

    if (item.link) {
      navigate(item.link);
    }
  };

  const markAllRead = async () => {
  try {
    const token = localStorage.getItem("token");

    await fetch(`${API}/notifications/read-all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        isRead: true,
      }))
    );

    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    loadNotifications();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>{t("notificationsPage.loading")}</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section
        style={{
          ...heroStyle,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          padding: isMobile ? 24 : 32,
        }}
      >
        <div>
          <div style={eyebrowStyle}>{t("notificationsPage.eyebrow")}</div>
          <h1 style={titleStyle}>{t("notificationsPage.title")}</h1>
          <p style={descStyle}>
            {t("notificationsPage.description")}
          </p>
        </div>

        <div
          style={{
            ...heroRightStyle,
            width: isMobile ? "100%" : undefined,
            marginTop: isMobile ? 16 : 0,
          }}
        >
  <div
    style={{
      ...heroStatStyle,
      width: isMobile ? "100%" : "auto",
      minWidth: isMobile ? 0 : 150,
      boxSizing: "border-box",
    }}
  >
    <span>{t("notificationsPage.unread")}</span>
    <strong>{unreadCount}</strong>
  </div>

  {unreadCount > 0 && (
    <button
      type="button"
      onClick={markAllRead}
      style={{
        ...readAllButtonStyle,
        width: isMobile ? "100%" : "auto",
        boxSizing: "border-box",
      }}
    >
      {t("notificationsPage.markAllRead")}
    </button>
  )}
</div>
      </section>

      {items.length === 0 ? (
        <div style={emptyCardStyle}>
          <h2 style={{ marginTop: 0 }}>{t("notificationsPage.emptyTitle")}</h2>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            {t("notificationsPage.emptyDescription")}
          </p>
          <Link to="/" style={primaryLinkStyle}>
            {t("notificationsPage.backHome")}
          </Link>
        </div>
      ) : (
        <section style={listStyle}>
          {items.map((item) => (
            <article
              key={item.id}
              style={{
                ...cardStyle,
                borderColor: item.isRead ? "#e2e8f0" : "#2563eb",
                background: item.isRead ? "white" : "#eff6ff",
              }}
            >
              <div style={iconStyle}>{item.isRead ? "✓" : "🔔"}</div>

              <div>
                <div style={cardTopStyle}>
                  <div>
                    <h2 style={cardTitleStyle}>{item.title}</h2>
                    <p style={dateStyle}>
                      {new Date(item.createdAt).toLocaleString(locale)}
                    </p>
                  </div>

                  {!item.isRead && <span style={badgeStyle}>{t("notificationsPage.new")}</span>}
                </div>

                <p style={messageStyle}>{item.message}</p>

                <div style={actionsStyle}>
                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      style={buttonStyle}
                    >
                      {t("notificationsPage.markRead")}
                    </button>
                  )}

                  {item.link && (
                    <button
                      type="button"
                      onClick={() => openNotification(item)}
                      style={detailButtonStyle}
                    >
                      {t("notificationsPage.goToDetail")}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const heroStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #020617, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 40,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  margin: 0,
  maxWidth: 620,
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const heroStatStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 20,
  padding: 20,
  minWidth: 150,
  display: "grid",
  gap: 6,
};

const listStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  display: "grid",
  gap: 14,
};

const cardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 22,
  padding: 20,
  display: "grid",
  gridTemplateColumns: "52px 1fr",
  gap: 16,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const iconStyle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "#dbeafe",
  color: "#1d4ed8",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 19,
  fontWeight: 900,
};

const dateStyle: CSSProperties = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const badgeStyle: CSSProperties = {
  background: "#2563eb",
  color: "white",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const messageStyle: CSSProperties = {
  color: "#334155",
  margin: "12px 0 14px",
  lineHeight: 1.6,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const buttonStyle: CSSProperties = {
  border: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 13px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};

const detailLinkStyle: CSSProperties = {
  textDecoration: "none",
  background: "white",
  color: "#1d4ed8",
  border: "1px solid #bfdbfe",
  padding: "10px 13px",
  borderRadius: 12,
  fontWeight: 900,
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const primaryLinkStyle: CSSProperties = {
  display: "inline-block",
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 900,
  marginTop: 10,
};
const heroRightStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const readAllButtonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  padding: "10px 13px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};
const detailButtonStyle: CSSProperties = {
  border: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "10px 13px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};
