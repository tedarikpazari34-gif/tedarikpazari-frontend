import { useEffect, useState, type CSSProperties } from "react";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type Wallet = {
  available: string | number;
  locked: string | number;
};

function formatMoney(value?: string | number) {
  return `${Number(value || 0).toLocaleString("tr-TR")} ₺`;
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Cüzdan bilgilerini görmek için giriş yapmalısınız.");
        return;
      }

      const res = await fetch(`${API}/wallet/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Cüzdan bilgisi alınamadı");
        return;
      }

      setWallet(data.wallet);
    } catch (err) {
      console.error(err);
      setError("Cüzdan yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>Cüzdan yükleniyor...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>FİNANS PANELİ</div>
          <h1 style={titleStyle}>Cüzdanım</h1>
          <p style={descStyle}>
            Kullanılabilir bakiyenizi, escrow/blokeli tutarları ve platform
            finans akışınızı tek ekrandan takip edin.
          </p>
        </div>

        <div style={heroAmountStyle}>
          <span>Kullanılabilir</span>
          <strong>{formatMoney(wallet?.available)}</strong>
        </div>
      </section>

      {error ? (
        <div style={errorCardStyle}>{error}</div>
      ) : wallet ? (
        <>
          <section style={gridStyle}>
            <div style={balanceCardStyle}>
              <div style={cardIconStyle}>₺</div>
              <p style={labelStyle}>Kullanılabilir Bakiye</p>
              <h2 style={greenAmountStyle}>{formatMoney(wallet.available)}</h2>
              <span style={hintStyle}>Çekilebilir veya kullanılabilir tutar</span>
            </div>

            <div style={lockedCardStyle}>
              <div style={cardIconStyle}>🔒</div>
              <p style={labelStyle}>Blokeli / Escrow</p>
              <h2 style={blueAmountStyle}>{formatMoney(wallet.locked)}</h2>
              <span style={hintStyle}>Sipariş tamamlanana kadar korunan tutar</span>
            </div>
          </section>

          <section style={infoPanelStyle}>
            <div>
              <div style={smallLabelStyle}>PLATFORM GÜVENCESİ</div>
              <h2 style={panelTitleStyle}>Escrow ödeme akışı</h2>
              <p style={panelTextStyle}>
                Alıcı ödemesi güvenli şekilde blokede tutulur. Sipariş teslim
                süreci tamamlandığında satıcı bakiyesine aktarılır.
              </p>
            </div>

            <div style={stepGridStyle}>
              <Step number="1" title="Ödeme alınır" />
              <Step number="2" title="Tutar blokeye alınır" />
              <Step number="3" title="Teslimat sonrası aktarılır" />
            </div>
          </section>
        </>
      ) : (
        <div style={emptyCardStyle}>Cüzdan bilgisi bulunamadı.</div>
      )}
    </main>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div style={stepStyle}>
      <span style={stepNumberStyle}>{number}</span>
      <strong>{title}</strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  boxShadow: "0 24px 50px rgba(15,23,42,0.18)",
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
  maxWidth: 720,
  color: "#cbd5e1",
  lineHeight: 1.7,
};

const heroAmountStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 20,
  padding: 20,
  minWidth: 190,
  display: "grid",
  gap: 6,
};

const gridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 20,
};

const balanceCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #bbf7d0",
  borderRadius: 24,
  padding: 26,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const lockedCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #bfdbfe",
  borderRadius: 24,
  padding: 26,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const cardIconStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 16,
  background: "#eff6ff",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  marginBottom: 14,
};

const labelStyle: CSSProperties = {
  color: "#64748b",
  fontWeight: 900,
  margin: "0 0 8px",
};

const greenAmountStyle: CSSProperties = {
  color: "#16a34a",
  fontSize: 36,
  margin: 0,
  fontWeight: 900,
};

const blueAmountStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 36,
  margin: 0,
  fontWeight: 900,
};

const hintStyle: CSSProperties = {
  display: "block",
  color: "#64748b",
  marginTop: 10,
};

const infoPanelStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 28,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
  boxShadow: "0 14px 34px rgba(15,23,42,0.08)",
};

const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const panelTitleStyle: CSSProperties = {
  color: "#0f172a",
  margin: "0 0 8px",
  fontSize: 28,
  fontWeight: 900,
};

const panelTextStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.7,
  margin: 0,
};

const stepGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const stepStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 16,
  padding: 16,
  display: "flex",
  alignItems: "center",
  gap: 12,
  color: "#0f172a",
};

const stepNumberStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 14px 34px rgba(15,23,42,0.10)",
};

const errorCardStyle: CSSProperties = {
  ...emptyCardStyle,
  color: "#991b1b",
};