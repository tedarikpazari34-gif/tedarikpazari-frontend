import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  role: string;
  totalSales: number;
  activeOrders: number;
  completedOrders: number;
  paidOrders: number;
  openRfqsCount: number;
  totalOrders: number;

  buyerOpenRfqs: number;
  buyerClosedRfqs: number;
  buyerQuoteCount: number;
  buyerOpenDisputes: number;
  buyerCompletedOrders: number;
  buyerPendingPayments: number;
}

export default function DashboardStats({
  role,
  totalSales,
  activeOrders,
  completedOrders,
  paidOrders,
  openRfqsCount,
  totalOrders,
  buyerOpenRfqs,
  buyerClosedRfqs,
  buyerQuoteCount,
  buyerOpenDisputes,
  buyerCompletedOrders,
  buyerPendingPayments,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  return (
    <>
      {role === "BUYER" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.openRfq")}</div>
              <div style={valueStyle}>{buyerOpenRfqs}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.closedRfq")}</div>
              <div style={valueStyle}>{buyerClosedRfqs}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.receivedQuotes")}</div>
              <div style={valueStyle}>{buyerQuoteCount}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.orderCount")}</div>
              <div style={valueStyle}>{totalOrders}</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>{t("dashboardStats.completedOrders")}</div>
              <div style={lightValueStyle}>{buyerCompletedOrders}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>{t("dashboardStats.pendingPayments")}</div>
              <div style={lightValueStyle}>{buyerPendingPayments}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>{t("dashboardStats.openDisputes")}</div>
              <div style={lightValueStyle}>{buyerOpenDisputes}</div>
            </div>
          </div>
        </>
      )}

      {role === "SELLER" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.totalSales")}</div>
              <div style={valueStyle}>
                {totalSales.toLocaleString(locale)} ₺
              </div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.activeOrders")}</div>
              <div style={valueStyle}>{activeOrders}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.openRfq")}</div>
              <div style={valueStyle}>{openRfqsCount}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>{t("dashboardStats.totalOrders")}</div>
              <div style={valueStyle}>{totalOrders}</div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>{t("dashboardStats.completedOrders")}</div>
              <div style={lightValueStyle}>{completedOrders}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>{t("dashboardStats.paidOrders")}</div>
              <div style={lightValueStyle}>{paidOrders}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>{t("dashboardStats.pendingRfqRequests")}</div>
              <div style={lightValueStyle}>{openRfqsCount}</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const darkCardStyle: React.CSSProperties = {
  background: "#111827",
  color: "#fff",
  borderRadius: 14,
  padding: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.9,
  marginBottom: 10,
};

const valueStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
};

const lightCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 16,
};

const lightLabelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 8,
};

const lightValueStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
};