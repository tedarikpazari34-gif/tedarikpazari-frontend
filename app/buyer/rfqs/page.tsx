"use client";

import { useEffect, useState } from "react";

type RFQ = {
  id: string;
  quantity: number;
  note?: string;
  status: string;
  product?: {
    title: string;
  };
};

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbW1ueXFndmQwMDAzamZkMGVxdnVjN3NqIiwidXNlcklkIjoiY21tbnlxZ3ZkMDAwM2pmZDBlcXZ1YzdzaiIsImVtYWlsIjoiYnV5ZXJAdGVzdC5jb20iLCJjb21wYW55SWQiOiJzZWVkLWJ1eWVyLWNvbXBhbnkiLCJyb2xlIjoiQlVZRVIiLCJjb21wYW55U3RhdHVzIjoiQVBQUk9WRUQiLCJpYXQiOjE3NzMzNjkzMTQsImV4cCI6MTc3Mzk3NDExNH0.pUdo7npv9pOolAC6souSMIu0jmJkajcBFeOZN3OE25E";

export default function BuyerRfqsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);

  useEffect(() => {
    fetch("http://localhost:3002/api/rfqs/mine", {
      headers: { Authorization: `Bearer ${TOKEN}` },
    })
      .then((res) => res.json())
      .then((data) => setRfqs(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("RFQ yükleme hatası:", err);
        setRfqs([]);
      });
  }, []);

  return (
    <main style={{ padding: 40, color: "white" }}>
      <h1>RFQ Taleplerim</h1>

      {rfqs.map((rfq) => (
        <div key={rfq.id} style={{ marginTop: 20 }}>
          <h3>{rfq.product?.title || "Ürün"}</h3>
          <p>Miktar: {rfq.quantity}</p>
          <p>Durum: {rfq.status}</p>

          <a href={`/buyer/rfqs/${rfq.id}`}>Teklifleri Gör</a>
        </div>
      ))}
    </main>
  );
}