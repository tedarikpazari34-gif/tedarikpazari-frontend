import { useState } from "react";
import { useTranslation } from "react-i18next";
import PanelNavigation, {
  type PanelMenuGroup,
} from "../dashboard/PanelNavigation";

export default function AdminSidebar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: PanelMenuGroup[] = [
    {
      title: t("adminSidebar.panel"),
      icon: "📊",
      items: [
        { label: t("adminSidebar.dashboard"), path: "/admin", icon: "📊" },
        {
          label: t("adminOrdersPage.title"),
          path: "/admin/orders",
          icon: "📦",
        },
        {
          label: t("accountSecurity.title"),
          path: "/admin/security",
          icon: "🔒",
        },
                {
          label: t("adminSidebar.controlCenter"),
          path: "/admin/control-center",
          icon: "⚙️",
        },
      ],
    },
    {
      title: t("panelNavigation.companyProducts"),
      icon: "🏢",
      items: [
        {
          label: t("adminSidebar.verificationRequests", {
            defaultValue: "Doğrulama Başvuruları",
          }),
          path: "/admin/verification-requests",
          icon: "✅",
        },
        {
          label: t("adminSidebar.companies"),
          path: "/admin/companies",
          icon: "🏢",
        },
        {
          label: t("adminSidebar.products"),
          path: "/admin/products",
          icon: "📦",
        },
      ],
    },
    {
      title: t("panelNavigation.moderationDisputes"),
      icon: "🛡️",
      items: [
        {
          label: t("adminSidebar.chatModeration", {
            defaultValue: "Mesaj Denetimi",
          }),
          path: "/admin/chat-moderation",
          icon: "💬",
        },
        {
          label: t("adminSidebar.disputes"),
          path: "/admin/disputes",
          icon: "⚖️",
        },
        ...(import.meta.env.VITE_CHARGEBACK_ENABLED === "true"
          ? [{
              label: t("adminSidebar.chargebacks", {
                defaultValue: "Harcama İtirazları",
              }),
              path: "/admin/chargebacks",
              icon: "🛡️",
            }]
          : []),
      ],
    },
    {
      title: t("panelNavigation.financePayouts"),
      icon: "💳",
      items: [
        {
          label: t("adminSidebar.finance"),
          path: "/admin/finance",
          icon: "💰",
        },
        {
          label: t("adminPayoutsPage.title"),
          path: "/admin/payouts",
          icon: "💳",
        },
      ],
    },
  ];

  const navigation = (
    <PanelNavigation
      groups={groups}
      title={t("adminSidebar.panel")}
    />
  );

  return (
    <>
      <style>{`
        .nex-admin-sidebar {
          width: 280px;
          flex: 0 0 280px;
          min-height: 100vh;
          box-sizing: border-box;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
          padding: 20px 14px;
        }
        .nex-admin-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .nex-admin-sidebar {
            display: none;
          }
          .nex-admin-mobile {
            display: block;
            position: fixed;
            top: 12px;
            right: 12px;
            z-index: 1000;
          }
          .nex-admin-mobile-panel {
            width: min(320px, calc(100vw - 24px));
            max-height: calc(100vh - 76px);
            overflow-y: auto;
            margin-top: 8px;
            padding: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            box-shadow: 0 12px 32px rgba(15,23,42,.18);
          }
        }
      `}</style>
      <aside className="nex-admin-sidebar">
        {navigation}
      </aside>
      <div className="nex-admin-mobile">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="nex-admin-mobile-navigation"
          onClick={() => setMobileOpen((value) => !value)}
          style={{
            background: "#0d9488",
            color: "#ffffff",
            border: 0,
            padding: "12px 16px",
            borderRadius: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mobileOpen ? t("panelNavigation.closeMenu") : `☰ ${t("panelNavigation.adminMenu")}`}
        </button>
        {mobileOpen && (
          <div
            id="nex-admin-mobile-navigation"
            className="nex-admin-mobile-panel"
          >
            {navigation}
          </div>
        )}
      </div>
    </>
  );
}
