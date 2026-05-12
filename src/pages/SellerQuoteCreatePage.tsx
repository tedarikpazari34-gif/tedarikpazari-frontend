import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function CreateQuotePage() {
  const [searchParams] = useSearchParams();
  const rfqIdFromUrl = searchParams.get("rfqId") || "";
  
  const [rfqId, setRfqId] = useState(rfqIdFromUrl);
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [note, setNote] = useState("");
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("https://tedarik-backend.onrender.com/api/quotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        rfqId,
        unitPrice: Number(price),
        deliveryDays: Number(days),
        sellerNote: note,
      }),
    });

    if (res.ok) {
      alert("Teklif gönderildi ✅");
    } else {
      alert("Hata ❌");
    }
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    width: "100%",
  };

  return (
    <main style={{ maxWidth: 600 }}>
      <h1 style={{ marginBottom: 20 }}>Teklif Ver</h1>

      <div style={{ marginBottom: 10 }}>
        <label>RFQ ID</label>
        <input
          style={inputStyle}
          value={rfqId}
          onChange={(e) => setRfqId(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Fiyat</label>
        <input
          style={inputStyle}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Teslim günü</label>
        <input
          style={inputStyle}
          value={days}
          onChange={(e) => setDays(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Not</label>
        <textarea
          style={inputStyle}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        style={{
          marginTop: 10,
          padding: "10px 16px",
          background: "#2563eb",
          borderRadius: 8,
          color: "white",
        }}
      >
        Gönder
      </button>
    </main>
  );
}