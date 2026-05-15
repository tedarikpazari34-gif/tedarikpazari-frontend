import { type CSSProperties } from "react";
import { Link } from "react-router-dom";

const notifications = [
  {
    id: "1",
    title: "Yeni RFQ talebi",
    text: "Bir alıcı yeni teklif talebi oluşturdu.",
    type: "RFQ",
    time: "Bugün",
  },
  {
    id: "2",
    title: "Teklif gönderildi",
    text: "Satıcı teklifinizi yanıtladı.",
    type: "Teklif",
    time: "Bugün",
  },
  {
    id: "3",
    title: "Sipariş güncellendi",
    text: "Siparişiniz kargoya verildi.",
    type: "Sipariş",
    time: "Dün",
  },
];

export default function NotificationsPage() {
  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>BİLDİRİM MERKEZİ</div>
          <h1 style={titleStyle}>Bildirimler</h1>
          <p style={descStyle}>
            RFQ, teklif, ödeme ve sipariş güncellemelerini buradan takip edin.
          </p>
        </div>

        <Link to="/" style={homeButtonStyle}>
          Ana Sayfa
        </Link>
      </section>

      <section style={listStyle}>
        {notifications.map((item) => (
          <article key={item.id} style={cardStyle}>
            <div style={iconStyle}>{item.type.charAt(0)}</div>

            <div>
              <div style={cardTopStyle}>
                <h2 style={cardTitleStyle}>{item.title}</h2>
                <span style={timeStyle}>{item.time}</span>
              </div>

              <p style={textStyle}>{item.text}</p>

              <span style={badgeStyle}>{item.type}</span>
            </div>
          </article>
        ))}
      </section>
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
  gap: 20,
  alignItems: "center",
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
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const homeButtonStyle: CSSProperties = {
  textDecoration: "none",
  background: "white",
  color: "#0f172a",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 900,
};

const listStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  display: "grid",
  gap: 14,
};

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 18,
  display: "grid",
  gridTemplateColumns: "48px 1fr",
  gap: 14,
  boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
};

const iconStyle: CSSProperties = {
  width: 48,
  height: 48,
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
  gap: 12,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: 18,
  fontWeight: 900,
};

const timeStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 700,
};

const textStyle: CSSProperties = {
  color: "#64748b",
  margin: "6px 0 10px",
};

const badgeStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};