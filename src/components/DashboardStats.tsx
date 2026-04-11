import React from "react";

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
              <div style={labelStyle}>Açık RFQ</div>
              <div style={valueStyle}>{buyerOpenRfqs}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>Kapanan RFQ</div>
              <div style={valueStyle}>{buyerClosedRfqs}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>Gelen Teklif</div>
              <div style={valueStyle}>{buyerQuoteCount}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>Sipariş Sayısı</div>
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
              <div style={lightLabelStyle}>Tamamlanan Sipariş</div>
              <div style={lightValueStyle}>{buyerCompletedOrders}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>Bekleyen Ödeme</div>
              <div style={lightValueStyle}>{buyerPendingPayments}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>Açık Dispute</div>
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
              <div style={labelStyle}>Toplam Satış</div>
              <div style={valueStyle}>
                {totalSales.toLocaleString("tr-TR")} ₺
              </div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>Aktif Sipariş</div>
              <div style={valueStyle}>{activeOrders}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>Açık RFQ</div>
              <div style={valueStyle}>{openRfqsCount}</div>
            </div>

            <div style={darkCardStyle}>
              <div style={labelStyle}>Toplam Sipariş</div>
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
              <div style={lightLabelStyle}>Tamamlanan Sipariş</div>
              <div style={lightValueStyle}>{completedOrders}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>Ödeme Alınmış Sipariş</div>
              <div style={lightValueStyle}>{paidOrders}</div>
            </div>

            <div style={lightCardStyle}>
              <div style={lightLabelStyle}>Bekleyen RFQ Talepleri</div>
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