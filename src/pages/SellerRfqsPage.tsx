import { useEffect, useState } from "react";

type Quote = {
  id: string;
  unitPrice?: number | string;
  deliveryDays?: number;
  note?: string | null;
};

type RFQ = {
  id: string;
  quantity: number;
  note?: string | null;
  status: string;
  product?: {
    title?: string;
  };
  buyer?: {
    name?: string;
  };
  quotes?: Quote[];
};

const API = "http://localhost:3002/api";

export default function SellerRfqsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRfq, setSelectedRfq] = useState<RFQ | null>(null);
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("3");
  const [note, setNote] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  const loadRfqs = async () => {
    try {
      setError("");

      const token = getToken();

      if (!token) {
        setError("Oturum bulunamadı");
        setRfqs([]);
        return;
      }

      const res = await fetch(`${API}/rfqs/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "RFQ listesi alınamadı");
        setRfqs([]);
        return;
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("RFQ LOAD ERROR:", err);
      setError("RFQ listesi alınamadı");
      setRfqs([]);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadRfqs();
  }, []);

  const openQuoteModal = (rfq: RFQ) => {
    setSelectedRfq(rfq);
    setPrice("");
    setDeliveryDays("3");
    setNote("");
  };

  const closeQuoteModal = () => {
    setSelectedRfq(null);
    setPrice("");
    setDeliveryDays("3");
    setNote("");
  };

  const submitQuote = async () => {
    if (!selectedRfq) return;

    if (!price || Number(price) <= 0) {
      alert("Lütfen geçerli bir birim fiyat girin.");
      return;
    }

    if (!deliveryDays || Number(deliveryDays) < 1) {
      alert("Teslim süresi en az 1 gün olmalı.");
      return;
    }

    try {
      setSubmitLoading(true);

      const token = getToken();

      if (!token) {
        alert("Oturum bulunamadı");
        return;
      }

      const res = await fetch(`${API}/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
  rfqId: selectedRfq.id,
  unitPrice: Number(price),
  deliveryDays: Number(deliveryDays),
}),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "Teklif gönderilemedi";

        alert(message);
        return;
      }

      alert("Teklif başarıyla gönderildi");
      closeQuoteModal();
      await loadRfqs();
    } catch (err) {
      console.error("QUOTE CREATE ERROR:", err);
      alert("Teklif gönderilirken hata oluştu");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (pageLoading) {
    return <p style={{ padding: 40 }}>Yükleniyor...</p>;
  }

  return (
    <main style={pageStyle}>
      <h1 style={pageTitleStyle}>Açık RFQ Talepleri</h1>

      {error && <p style={errorStyle}>{error}</p>}

      {rfqs.length === 0 ? (
        <p style={emptyStyle}>Açık RFQ bulunamadı.</p>
      ) : (
        <div style={gridStyle}>
          {rfqs.map((rfq) => (
            <div key={rfq.id} style={cardStyle}>
              <h2 style={cardTitleStyle}>
                {rfq.product?.title || "Ürün yok"}
              </h2>

              <p style={cardTextStyle}>
                <b>Buyer:</b> {rfq.buyer?.name || "-"}
              </p>

              <p style={cardTextStyle}>
                <b>Miktar:</b> {rfq.quantity}
              </p>

              <p style={cardTextStyle}>
                <b>Durum:</b> {rfq.status}
              </p>

              <p style={cardTextStyle}>
                <b>Not:</b> {rfq.note || "-"}
              </p>

              <p style={cardTextStyle}>
                <b>Mevcut Teklif:</b> {rfq.quotes?.length || 0}
              </p>

              <button onClick={() => openQuoteModal(rfq)} style={quoteButtonStyle}>
                Teklif Ver
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRfq && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0, marginBottom: 16 }}>Teklif Ver</h2>

            <p>
              <b>Ürün:</b> {selectedRfq.product?.title || "Ürün yok"}
            </p>

            <p>
              <b>Buyer:</b> {selectedRfq.buyer?.name || "-"}
            </p>

            <p>
              <b>Miktar:</b> {selectedRfq.quantity}
            </p>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Birim Fiyat (₺)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={inputStyle}
                placeholder="Örn: 100"
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Teslim Süresi (Gün)</label>
              <input
                type="number"
                min="1"
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
                style={inputStyle}
                placeholder="Örn: 3"
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Satıcı Notu</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={textareaStyle}
                placeholder="Teslim süresi, stok durumu, ekstra bilgi..."
              />
            </div>

            <div style={modalActionsStyle}>
              <button onClick={closeQuoteModal} style={cancelButtonStyle}>
                Vazgeç
              </button>

              <button
                onClick={submitQuote}
                style={submitButtonStyle}
                disabled={submitLoading}
              >
                {submitLoading ? "Gönderiliyor..." : "Teklifi Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  padding: 40,
  background: "#020617",
  minHeight: "100vh",
  color: "white",
};

const pageTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  fontSize: 32,
  fontWeight: 800,
};

const errorStyle: React.CSSProperties = {
  color: "#fca5a5",
  marginBottom: 20,
};

const emptyStyle: React.CSSProperties = {
  color: "#cbd5e1",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: 20,
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: 20,
  background: "#0f172a",
  color: "white",
};

const cardTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  fontSize: 22,
  fontWeight: 700,
};

const cardTextStyle: React.CSSProperties = {
  margin: "6px 0",
  color: "#cbd5e1",
};

const quoteButtonStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  background: "white",
  color: "#111827",
  borderRadius: 14,
  padding: 24,
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 100,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: 12,
  fontSize: 14,
  resize: "vertical",
};

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 20,
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "white",
  cursor: "pointer",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  border: "none",
  borderRadius: 8,
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: 600,
};