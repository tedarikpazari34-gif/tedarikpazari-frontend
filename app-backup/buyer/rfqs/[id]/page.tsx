"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Quote = {
  id: string;
  unitPrice: string;
  deliveryDays: number;
  sellerNote?: string | null;
  status: string;
};

type RFQ = {
  id: string;
  quantity: number;
  note?: string | null;
  status: string;
  product?: { title: string };
  quotes?: Quote[];
};

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1ueXFndmQwMDAzamZkMGVxdnVjN3NqIiwidXNlcklkIjoiY21tbnlxZ3ZkMDAwM2pmZDBlcXZ1YzdzaiIsImVtYWlsIjoiYnV5ZXJAdGVzdC5jb20iLCJjb21wYW55SWQiOiJzZWVkLWJ1eWVyLWNvbXBhbnkiLCJyb2xlIjoiQlVZRVIiLCJjb21wYW55U3RhdHVzIjoiQVBQUk9WRUQiLCJpYXQiOjE3NzMzNjkzMTQsImV4cCI6MTc3Mzk3NDExNH0.pUdo7npv9pOolAC6souSMIu0jmJkajcBFeOZN3OE25E";

export default function BuyerRfqDetailPage() {
  const params = useParams();
  const rfqId = String(params?.id || "");

  const [rfq, setRfq] = useState<RFQ | null>(null);

  useEffect(() => {
    fetch("http://localhost:3002/api/rfqs/mine", {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((r: RFQ) => r.id === rfqId);
        setRfq(found);
      });
  }, [rfqId]);

  if (!rfq) return <p>Yükleniyor...</p>;

  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>Teklifler</h1>

      <h2>{rfq.product?.title}</h2>
      <p>Miktar: {rfq.quantity}</p>

      {rfq.quotes?.map((q) => (
        <div key={q.id} style={{ marginTop: 20 }}>
          <p>Fiyat: {q.unitPrice} ₺</p>
          <p>Teslim: {q.deliveryDays} gün</p>
          <p>Not: {q.sellerNote}</p>
          <p>Durum: {q.status}</p>
        </div>
      ))}
    </main>
  );
}
