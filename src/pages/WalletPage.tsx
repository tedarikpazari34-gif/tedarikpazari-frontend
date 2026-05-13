import { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type Wallet = {
  available: string | number;
  locked: string | number;
};

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
        setError("Oturum bulunamadı");
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

  if (loading) return <p style={{ padding: 40 }}>Yükleniyor...</p>;

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Cüzdanım</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {wallet && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            maxWidth: 700,
          }}
        >
          <div style={card}>
            <p style={label}>Kullanılabilir Bakiye</p>
            <h2 style={amount}>
              {Number(wallet.available || 0).toLocaleString("tr-TR")} ₺
            </h2>
          </div>

          <div style={card}>
            <p style={label}>Blokeli / Escrow</p>
            <h2 style={amount}>
              {Number(wallet.locked || 0).toLocaleString("tr-TR")} ₺
            </h2>
          </div>
        </div>
      )}
    </main>
  );
}

const card = {
  background: "#0f172a",
  color: "white",
  borderRadius: 18,
  padding: 24,
};

const label = {
  color: "#cbd5e1",
  fontSize: 14,
  marginBottom: 8,
};

const amount = {
  fontSize: 32,
  fontWeight: 800,
  margin: 0,
  color: "#22c55e",
};