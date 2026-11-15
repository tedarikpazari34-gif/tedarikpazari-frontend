import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export type PanelMenuItem = {
  label: string;
  path: string;
  icon?: string;
};

export type PanelMenuGroup = {
  title: string;
  icon?: string;
  items: PanelMenuItem[];
};

type Props = {
  groups: PanelMenuGroup[];
  title: string;
};

const colors = {
  navy: "#0f172a",
  turquoise: "#0d9488",
  light: "#f0fdfa",
  muted: "#64748b",
};

export default function PanelNavigation({ groups, title }: Props) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const isRtl = i18n.language.split("-")[0] === "ar";

  const matchesPath = (path: string) =>
    location.pathname === path ||
    (path !== "/admin" && location.pathname.startsWith(path + "/"));

  const [groupOverrides, setGroupOverrides] = useState<
    Record<string, boolean>
  >({});

  const toggleGroup = (key: string, isOpen: boolean) => {
    setGroupOverrides((current) => ({
      ...current,
      [key]: !isOpen,
    }));
  };

  return (
    <nav aria-label={title} dir={isRtl ? "rtl" : "ltr"} style={navigationStyle}>
      <div style={headingStyle}>{title}</div>

      {groups.map((group) => {
        const groupKey = group.items.map((item) => item.path).join("|");
        const isActive = group.items.some((item) => matchesPath(item.path));
        const overrideKey = `${location.pathname}:${groupKey}`;
        const isOpen = groupOverrides[overrideKey] ?? isActive;

        return (
          <div key={group.title} style={groupStyle}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleGroup(overrideKey, isOpen)}
              style={{
                ...groupButtonStyle,
                textAlign: isRtl ? "right" : "left",
                color: isActive ? colors.turquoise : colors.navy,
              }}
            >
              <span>
                {group.icon ? `${group.icon} ` : ""}
                {group.title}
              </span>
              <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
              <div style={itemsStyle}>
                {group.items.map((item) => {
                  const active = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      aria-current={active ? "page" : undefined}
                      style={{
                        ...linkStyle,
                        ...(active ? activeLinkStyle : {}),
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

const navigationStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const headingStyle: CSSProperties = {
  color: colors.navy,
  fontWeight: 800,
  fontSize: 18,
  padding: "12px 10px",
};

const groupStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  overflow: "hidden",
  background: "#ffffff",
};

const groupButtonStyle: CSSProperties = {
  width: "100%",
  border: 0,
  background: "#ffffff",
  padding: "14px 12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  textAlign: "left",
};

const itemsStyle: CSSProperties = {
  padding: "0 8px 8px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const linkStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "11px 12px",
  borderRadius: 9,
  color: colors.muted,
  textDecoration: "none",
  fontSize: 14,
};

const activeLinkStyle: CSSProperties = {
  background: colors.light,
  color: colors.turquoise,
  fontWeight: 700,
};
