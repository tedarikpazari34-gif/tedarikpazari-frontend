import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type NavItem = {
  label: string;
  to: string;
};

type NotificationItem = {
  id: string;
  isRead: boolean;
};

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

const buyerLinks: NavItem[] = [
  { label: "Ana Sayfa", to: "/" },
  { label: "Ürünler", to: "/products" },
  { label: "Tekliflerim", to: "/tekliflerim" },
  { label: "Siparişlerim", to: "/buyer/orders" },
];

const sellerLinks: NavItem[] = [
  { label: "Gelen Talepler", to: "/seller/rfqs" },
  { label: "Ürünlerim", to: "/seller/products" },
  { label: "Seller Siparişleri", to: "/seller/orders" },
];

const accountLinks: NavItem[] = [
  { label: "Cüzdanım", to: "/wallet" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (!token) {
          setUnreadCount(0);
          return;
        }

        const res = await fetch(`${API}/notifications/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!Array.isArray(data)) {
          setUnreadCount(0);
          return;
        }

        const count = data.filter(
          (item: NotificationItem) => !item.isRead
        ).length;

        setUnreadCount(count);
      } catch (err) {
        console.error("NOTIFICATION COUNT ERROR:", err);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();

    window.addEventListener("storage", loadUnreadCount);

    return () => {
      window.removeEventListener("storage", loadUnreadCount);
    };
  }, [token]);

  const logout = () => {
    localStorage.clear();
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
            <small style={brandSubStyle}>B2B Marketplace</small>
          </span>
        </Link>

        <nav style={desktopNavStyle}>
          <NavGroup items={buyerLinks} />
          <NavGroup items={sellerLinks} />
          <NavGroup items={accountLinks} />

          <Link to="/notifications" style={bellStyle}>
            🔔
            {unreadCount > 0 && (
              <span style={badgeStyle}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {token ? (
            <button onClick={logout} style={logoutButtonStyle}>
              Çıkış Yap
            </button>
          ) : (
            <div style={authGroupStyle}>
              <Link to="/login" style={loginButtonStyle}>
                Giriş Yap
              </Link>

              <Link to="/register" style={registerButtonStyle}>
                Üye Ol
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
            title="Alıcı Paneli"
            items={buyerLinks}
            close={() => setOpen(false)}
          />

          <MobileSection
            title="Satıcı Paneli"
            items={sellerLinks}
            close={() => setOpen(false)}
          />

          <MobileSection
            title="Hesap"
            items={accountLinks}
            close={() => setOpen(false)}
          />

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            style={mobileNotificationStyle}
          >
            🔔 Bildirimler
            {unreadCount > 0 && (
              <span style={mobileBadgeStyle}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {token ? (
            <button onClick={logout} style={mobileLogoutStyle}>
              Çıkış Yap
            </button>
          ) : (
            <div style={mobileAuthStyle}>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={loginButtonStyle}
              >
                Giriş Yap
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                style={registerButtonStyle}
              >
                Üye Ol
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavGroup({ items }: { items: NavItem[] }) {
  return (
    <div style={navGroupStyle}>
      {items.map((item) => (
        <Link key={item.to} to={item.to} style={linkStyle}>
          {item.label}
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
          {item.label}
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