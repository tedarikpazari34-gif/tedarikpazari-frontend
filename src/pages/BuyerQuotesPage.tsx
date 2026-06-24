import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type Quote = {
  id: string;
  unitPrice: string;
  deliveryDays: number;
  sellerNote?: string;
  status: string;
  seller?: {
    name?: string;
  };
};

type RFQ = {
  id: string;
  quantity: number;
  note?: string;
  status: string;
  product?: {
    title: string;
  };
  quotes?: Quote[];
};

const TOKEN = localStorage.getItem("token");

export default function BuyerRfqDetailPage() {
  const params = useParams();
  const rfqId = params?.id as string;

  const [rfq, setRfq] = useState<RFQ | null>(null);

  useEffect(() => {
    fetch("https://tedarik-backend.onrender.com/api/rfqs/mine", {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
const found = safeData.find((r: RFQ) => r.id === rfqId);
setRfq(found || null);
      });
  }, [rfqId]);

  if (!rfq) {
    return (
      <main style={{ padding: 40, color: "white" }}>
        RFQ bulunamadı
      </main>
    );
  }

  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>Teklifler</h1>

      <h2>{rfq.product?.title}</h2>
      <p>Miktar: {rfq.quantity}</p>
      <p>Durum: {rfq.status}</p>
      <p>Not: {rfq.note}</p>

      <h3 style={{ marginTop: 30 }}>Gelen Teklifler</h3>

      {rfq.quotes && rfq.quotes.length > 0 ? (
        rfq.quotes.map((q) => (
          <div
            key={q.id}
            style={{
              border: "1px solid #334155",
              padding: 20,
              borderRadius: 10,
              marginTop: 20,
              background: "#0f172a",
            }}
          >
            <p>Satıcı: {q.seller?.name || "Tedarikçi"}</p>
            <p>Fiyat: {q.unitPrice} ₺</p>
            <p>Teslim: {q.deliveryDays} gün</p>
            <p>Not: {q.sellerNote}</p>
            <p>Durum: {q.status}</p>
          </div>
        ))
      ) : (
        <p>Henüz teklif yok.</p>
      )}
    </main>
  );
}
