import { Link, useLocation } from "react-router-dom";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

type NavItem = {
  label: string;
  icon: string;
  to: string;
};

const buildItems = (t: any): NavItem[] => [
  { label: t("common.home"), icon: "⌂", to: "/" },
  { label: t("common.products"), icon: "⌕", to: "/products" },
  { label: t("mobileBottomNav.getQuote"), icon: "+", to: "/buyer/rfqs/new" },
  { label: t("common.favorites"), icon: "♡", to: "/favorites" },
  { label: t("mobileBottomNav.account"), icon: "◉", to: "/panel" },
]

export default function MobileBottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const items = buildItems(t);

  return (
    <nav style={navStyle} aria-label={t("mobileBottomNav.ariaLabel")}>
      {items.map((item) => {
        const active =
          item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);

        return (
          <Link
            key={item.to}
            to={item.to}
            style={{
              ...itemStyle,
              color: active ? "#2563eb" : "#64748b",
            }}
          >
            <span
              style={{
                ...iconStyle,
                background: active ? "#eff6ff" : "transparent",
                color: active ? "#2563eb" : "#64748b",
              }}
            >
              {item.icon}
            </span>

            <span style={labelStyle}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

const navStyle: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 100,
  display: "none",
  gridTemplateColumns: "repeat(5, 1fr)",
  alignItems: "center",
  gap: 2,
  padding: "8px 8px calc(8px + env(safe-area-inset-bottom))",
  background: "rgba(255,255,255,0.96)",
  borderTop: "1px solid #e2e8f0",
  boxShadow: "0 -8px 24px rgba(15,23,42,0.12)",
  backdropFilter: "blur(16px)",
};

const itemStyle: CSSProperties = {
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  padding: "4px 2px",
  textDecoration: "none",
  fontWeight: 800,
};

const iconStyle: CSSProperties = {
  width: 34,
  height: 30,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  fontSize: 21,
  fontWeight: 900,
};

const labelStyle: CSSProperties = {
  fontSize: 10,
  lineHeight: 1,
  whiteSpace: "nowrap",
};
