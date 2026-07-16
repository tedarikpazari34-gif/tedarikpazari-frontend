import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { TURKEY_CITIES } from "../constants/turkeyCities";

const API = "https://tedarik-backend.onrender.com/api";

export default function BuyerShippingRequestPage() {
  const [params] = useSearchParams();
  const requestedOrderId = params.get("orderId") || "";

  const [orders, setOrders] = useState<any[]>([]);
  const [orderId, setOrderId] = useState(requestedOrderId);
  const [fromAddress, setFromAddress] = useState("İstanbul");
  const [toAddress, setToAddress] = useState("Ankara");
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        const loadedOrders = Array.isArray(data) ? data : [];

        setOrders(loadedOrders);

        if (
          requestedOrderId &&
          loadedOrders.some((order) => order.id === requestedOrderId)
        ) {
          setOrderId(requestedOrderId);
        }
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [requestedOrderId]);

  const submit = async () => {
    if (!orderId) {
      alert("Sipariş seçmelisiniz");
      return;
    }

    if (!fromAddress) {
      alert("Çıkış şehrini seçmelisiniz");
      return;
    }

    if (!toAddress) {
      alert("Varış şehrini seçmelisiniz");
      return;
    }

    if (fromAddress === toAddress) {
      alert("Çıkış ve varış şehri aynı olamaz");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/rfq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          fromAddress,
          toAddress,
          weight: weight ? Number(weight) : null,
          volume: volume ? Number(volume) : null,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Nakliye talebi oluşturulamadı");
        return;
      }

      alert("Nakliye talebi oluşturuldu ✅");
      setOrderId("");
      setNote("");
    } catch (err) {
      console.error(err);
      alert("Hata oluştu");
    }
  };

  if (loading) {
    return <main style={{ padding: 40 }}>Yükleniyor...</main>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🚚 Nakliye Teklifi İste</h1>

      <div style={{ maxWidth: 600, display: "grid", gap: 14 }}>
        <label>Sipariş</label>
        <select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
          <option value="">Sipariş seç</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              #{order.id.slice(0, 8)} - {order.rfq?.product?.title || "Ürün"} -{" "}
              {order.status}
            </option>
          ))}
        </select>

        <label>Çıkış Şehri</label>
        <select
          value={fromAddress}
          onChange={(e) => setFromAddress(e.target.value)}
        >
          <option value="">Şehir seçin</option>
          {TURKEY_CITIES.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>

        <label>Varış Şehri</label>
        <select
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
        >
          <option value="">Şehir seçin</option>
          {TURKEY_CITIES.map((cityName) => (
            <option key={cityName} value={cityName}>
              {cityName}
            </option>
          ))}
        </select>

        <label>Ağırlık</label>
        <input value={weight} onChange={(e) => setWeight(e.target.value)} />

        <label>Hacim</label>
        <input value={volume} onChange={(e) => setVolume(e.target.value)} />

        <label>Not</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} />

        <button onClick={submit}>Nakliye Talebi Oluştur</button>
      </div>
    </main>
  );
}