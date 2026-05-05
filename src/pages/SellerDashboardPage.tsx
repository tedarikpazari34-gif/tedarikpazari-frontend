import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  status: string;
  totalAmount?: number | string;
};

type RFQ = {
  id: string;
  status?: string;
};

export default function SellerDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [ordersRes, rfqsRes] = await Promise.all([
          fetch("http://localhost:3002/api/orders", {
            headers: authHeaders(),
          }),
          fetch("http://localhost:3002/api/rfqs/open", {
            headers: authHeaders(),
          }),
        ]);

        const ordersData = await ordersRes.json();
        const rfqsData = await rfqsRes.json();

        const safeOrders = Array.isArray(ordersData)
          ? ordersData
          : Array.isArray(ordersData?.data)
          ? ordersData.data
          : Array.isArray(ordersData?.orders)
          ? ordersData.orders
          : [];

        const safeRfqs = Array.isArray(rfqsData)
          ? rfqsData
          : Array.isArray(rfqsData?.data)
          ? rfqsData.data
          : Array.isArray(rfqsData?.rfqs)
          ? rfqsData.rfqs
          : [];

        setOrders(safeOrders);
        setRfqs(safeRfqs);
      } catch (error) {
        console.error("Seller dashboard yükleme hatası:", error);
        setOrders([]);
        setRfqs([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const totalSales = useMemo(() => {
    return orders.reduce((sum, order) => {
      return sum + (Number(order.totalAmount) || 0);
    }, 0);
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) => !["COMPLETED", "CANCELLED"].includes(order.status)
    ).length;
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((order) => order.status === "COMPLETED").length;
  }, [orders]);

  const paidOrders = useMemo(() => {
    return orders.filter((order) =>
      ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status)
    ).length;
  }, [orders]);

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>Seller Dashboard</h1>
        <div style={infoBoxStyle}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={headerRowStyle}>
        <div>
          <h1 style={titleStyle}>Seller Dashboard</h1>
          <p style={subtitleStyle}>
            Sipariş, RFQ ve satış özetini buradan takip edebilirsiniz.
          </p>
        </div>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle}>
          <div style={cardLabelStyle}>Toplam Satış</div>
          <div style={cardValueStyle}>
            {totalSales.toLocaleString("tr-TR")} ₺
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardLabelStyle}>Aktif Sipariş</div>
          <div style={cardValueStyle}>{activeOrders}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardLabelStyle}>Açık RFQ</div>
          <div style={cardValueStyle}>{rfqs.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={cardLabelStyle}>Toplam Sipariş</div>
          <div style={cardValueStyle}>{orders.length}</div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Hızlı Özet</h2>

        <div style={summaryGridStyle}>
          <div style={summaryCardStyle}>
            <div style={summaryLabelStyle}>Tamamlanan Sipariş</div>
            <div style={summaryValueStyle}>{completedOrders}</div>
          </div>

          <div style={summaryCardStyle}>
            <div style={summaryLabelStyle}>Ödeme Alınmış Sipariş</div>
            <div style={summaryValueStyle}>{paidOrders}</div>
          </div>

          <div style={summaryCardStyle}>
            <div style={summaryLabelStyle}>Bekleyen RFQ Talepleri</div>
            <div style={summaryValueStyle}>{rfqs.length}</div>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Son Sipariş Durumları</h2>

        {orders.length === 0 ? (
          <div style={infoBoxStyle}>Henüz sipariş bulunmuyor.</div>
        ) : (
          <div style={listStyle}>
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} style={listItemStyle}>
                <div>
                  <div style={itemTitleStyle}>Sipariş: {order.id}</div>
                  <div style={itemSubStyle}>
                    Toplam: {Number(order.totalAmount || 0).toLocaleString("tr-TR")} ₺
                  </div>
                </div>

                <span style={statusBadgeStyle(order.status)}>{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Açık RFQ Talepleri</h2>

        {rfqs.length === 0 ? (
          <div style={infoBoxStyle}>Açık RFQ bulunmuyor.</div>
        ) : (
          <div style={listStyle}>
            {rfqs.slice(0, 5).map((rfq) => (
              <div key={rfq.id} style={listItemStyle}>
                <div>
                  <div style={itemTitleStyle}>RFQ: {rfq.id}</div>
                  <div style={itemSubStyle}>Durum: {rfq.status || "OPEN"}</div>
                </div>

                <span style={rfqBadgeStyle}>Açık Talep</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  padding: 32,
  background: "#f8fafc",
  minHeight: "100vh",
  color: "#111827",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 800,
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 8,
  color: "#6b7280",
  fontSize: 15,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 24,
};

const cardStyle: React.CSSProperties = {
  background: "#111827",
  color: "#fff",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: 14,
  opacity: 0.9,
  marginBottom: 10,
};

const cardValueStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
};

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 20,
  marginBottom: 20,
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
  fontSize: 20,
  fontWeight: 800,
};

const summaryGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 14,
};

const summaryCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  background: "#f9fafb",
};

const summaryLabelStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
  marginBottom: 8,
};

const summaryValueStyle: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 800,
  color: "#111827",
};

const listStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const listItemStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const itemTitleStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#111827",
  marginBottom: 4,
};

const itemSubStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#6b7280",
};

const infoBoxStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 12,
  padding: 18,
  color: "#374151",
};

const rfqBadgeStyle: React.CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const statusBadgeStyle = (status: string): React.CSSProperties => {
  const common: React.CSSProperties = {
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  };

  switch (status) {
    case "PENDING_PAYMENT":
      return { ...common, background: "#fef3c7", color: "#92400e" };
    case "PAID":
      return { ...common, background: "#dbeafe", color: "#1d4ed8" };
    case "PREPARING":
      return { ...common, background: "#e9d5ff", color: "#7e22ce" };
    case "SHIPPED":
      return { ...common, background: "#cffafe", color: "#155e75" };
    case "COMPLETED":
      return { ...common, background: "#dcfce7", color: "#166534" };
    default:
      return { ...common, background: "#e5e7eb", color: "#374151" };
  }
};