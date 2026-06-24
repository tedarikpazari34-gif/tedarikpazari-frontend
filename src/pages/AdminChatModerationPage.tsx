import { useEffect, useState, type CSSProperties } from "react";

type FlaggedMessage = {
  id: string;
  content: string;
  createdAt: string;
  sender?: {
    email?: string;
    role?: string;
  };
  thread?: {
    rfq?: {
      product?: {
        title?: string;
      };
    };
    order?: {
      id?: string;
    };
  };
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

export default function AdminChatModerationPage() {
  const [messages, setMessages] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/chat/admin/flagged`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            ADMIN MODERATION
          </div>

          <h1 style={titleStyle}>
            Şüpheli Chat Mesajları
          </h1>
        </div>
      </div>

      {loading ? (
        <div style={emptyStyle}>
          Yükleniyor...
        </div>
      ) : messages.length === 0 ? (
        <div style={emptyStyle}>
          Şüpheli mesaj bulunamadı ✅
        </div>
      ) : (
        <section style={gridStyle}>
          {messages.map((msg) => (
            <article
              key={msg.id}
              style={cardStyle}
            >
              <div style={topStyle}>
                <span style={dangerBadgeStyle}>
                  FLAGGED
                </span>

                <span style={dateStyle}>
                  {new Date(
                    msg.createdAt
                  ).toLocaleString("tr-TR")}
                </span>
              </div>

              <div style={metaStyle}>
                <strong>
                  {msg.sender?.email}
                </strong>

                <span>
                  {msg.sender?.role}
                </span>
              </div>

              <div style={productStyle}>
                {msg.thread?.rfq?.product
                  ?.title ||
                  (msg.thread?.order?.id
                    ? `Sipariş #${msg.thread.order.id.slice(
                        0,
                        8
                      )}`
                    : "Chat")}
              </div>

              <div style={messageBoxStyle}>
                {msg.content}
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
  padding: 24,
};

const headerStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto 24px",
};

const eyebrowStyle: CSSProperties = {
  color: "#dc2626",
  fontSize: 12,
  fontWeight: 900,
};

const titleStyle: CSSProperties = {
  fontSize: 38,
  fontWeight: 900,
  margin: "6px 0 0",
};

const gridStyle: CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 22,
  padding: 20,
  border: "1px solid #fecaca",
  boxShadow:
    "0 12px 28px rgba(15,23,42,0.08)",
  display: "grid",
  gap: 14,
};

const topStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const dangerBadgeStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 11,
  fontWeight: 900,
};

const dateStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
};

const metaStyle: CSSProperties = {
  display: "grid",
  gap: 4,
  color: "#334155",
};

const productStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 12,
  padding: 10,
  fontWeight: 800,
};

const messageBoxStyle: CSSProperties = {
  background: "#fff1f2",
  border: "1px solid #fecdd3",
  borderRadius: 14,
  padding: 14,
  color: "#881337",
  lineHeight: 1.6,
};

const emptyStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 30,
  textAlign: "center",
  maxWidth: 720,
  margin: "0 auto",
};