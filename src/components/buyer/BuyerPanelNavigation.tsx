import { useState } from "react";
import { useTranslation } from "react-i18next";
import PanelNavigation, {
  type PanelMenuGroup,
} from "../dashboard/PanelNavigation";

export default function BuyerPanelNavigation() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: PanelMenuGroup[] = [
    {
      title: t("common.dashboard"),
      icon: "📊",
      items: [
        {
          label: t("common.dashboard"),
          path: "/buyer/dashboard",
          icon: "📊",
        },
      ],
    },
    {
      title: t("common.products"),
      icon: "📦",
      items: [
        {
          label: t("common.products"),
          path: "/products",
          icon: "🔎",
        },
        {
          label: t("common.favorites"),
          path: "/favorites",
          icon: "❤️",
        },
      ],
    },
    {
      title: t("common.myOrders"),
      icon: "🧾",
      items: [
        {
          label: t("common.myOrders"),
          path: "/buyer/orders",
          icon: "📦",
        },
        {
          label: t("common.shippingQuotes"),
          path: "/buyer/shipping-quotes",
          icon: "🚚",
        },
        {
          label: t("buyerDashboard.shippingRequests"),
          path: "/buyer/shipping-request",
          icon: "📋",
        },
      ],
    },
    {
      title: t("common.wallet"),
      icon: "💳",
      items: [
        {
          label: t("common.wallet"),
          path: "/wallet",
          icon: "💳",
        },
      ],
    },
    {
      title: t("common.companyProfile"),
      icon: "🏢",
      items: [
        {
          label: t("common.companyProfile"),
          path: "/buyer/profile",
          icon: "🏢",
        },
        {
          label: t("accountSecurity.title"),
          path: "/buyer/security",
          icon: "🔒",
        },
        {
          label: t("common.companyVerification"),
          path: "/company/verification",
          icon: "✅",
        },
        {
          label: t("common.messages"),
          path: "/chat",
          icon: "💬",
        },
      ],
    },
  ];

  return (
    <>
      <style>{`
        .nex-buyer-sidebar {
          width: 280px;
          flex: 0 0 280px;
          min-height: 100vh;
          padding: 20px 14px;
          box-sizing: border-box;
          background: #ffffff;
          border-right: 1px solid #e2e8f0;
        }
        .nex-buyer-mobile {
          display: none;
        }
        @media (max-width: 768px) {
          .nex-buyer-sidebar {
            display: none;
          }
          .nex-buyer-mobile {
            display: block;
            position: fixed;
            right: 12px;
            top: 70px;
            z-index: 1000;
          }
          .nex-buyer-mobile-panel {
            width: min(320px, calc(100vw - 24px));
            max-height: calc(100vh - 130px);
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

      <aside className="nex-buyer-sidebar">
        <PanelNavigation
          groups={groups}
          title={t("common.dashboard")}
        />
      </aside>

      <div className="nex-buyer-mobile">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="nex-buyer-mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          style={{
            background: "#0d9488",
            color: "#ffffff",
            border: 0,
            borderRadius: 10,
            padding: "12px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {mobileOpen ? t("panelNavigation.closeMenu") : `☰ ${t("panelNavigation.buyerMenu")}`}
        </button>

        {mobileOpen && (
          <div
            id="nex-buyer-mobile-navigation"
            className="nex-buyer-mobile-panel"
          >
            <PanelNavigation
              groups={groups}
              title={t("common.dashboard")}
            />
          </div>
        )}
      </div>
    </>
  );
}
