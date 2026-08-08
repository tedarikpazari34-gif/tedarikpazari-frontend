import { useEffect, useState } from "react";

const API = "https://tedarik-backend.onrender.com/api";

type VerificationRequest = {
  id: string;
  documentUrl: string;
  documentType?: string | null;
  fileName?: string | null;
  note?: string | null;
  adminNote?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
};

export default function CompanyVerificationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("VERGI_LEVHASI");
  const [note, setNote] = useState("");
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  const loadRequests = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/verification/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const submitVerification = async () => {
    if (!file) {
      setMessage("Lütfen bir belge seçin.");
      return;
    }

    if (!token) {
      setMessage("Oturum bulunamadı.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(`${API}/upload/verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setMessage(uploadData?.message || "Belge yüklenemedi.");
        return;
      }

      const createRes = await fetch(`${API}/verification`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentUrl: uploadData.documentUrl,
          documentType,
          fileName: uploadData.originalName,
          publicId: uploadData.publicId,
          note,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        setMessage(createData?.message || "Başvuru oluşturulamadı.");
        return;
      }

      setMessage("Doğrulama başvurunuz alındı.");
      setFile(null);
      setNote("");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setMessage("İşlem sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = (status: string) => {
    if (status === "APPROVED") return "Onaylandı";
    if (status === "REJECTED") return "Reddedildi";
    return "İncelemede";
  };

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Firma Doğrulama</h1>

        <p style={descStyle}>
          Firmanızı doğrulatmak için vergi levhası, faaliyet belgesi veya
          ticaret sicili belgesi yükleyebilirsiniz.
        </p>

        <div style={formGridStyle}>
          <label style={labelStyle}>
            Belge Türü
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={inputStyle}
            >
              <option value="VERGI_LEVHASI">Vergi Levhası</option>
              <option value="FAALIYET_BELGESI">Faaliyet Belgesi</option>
              <option value="TICARET_SICIL">Ticaret Sicili Belgesi</option>
              <option value="DIGER">Diğer</option>
            </select>
          </label>

          <label style={labelStyle}>
            Belge
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Not
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="İsterseniz kısa bir açıklama ekleyin"
              style={{ ...inputStyle, minHeight: 100 }}
            />
          </label>
        </div>

        <button
          onClick={submitVerification}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? "Gönderiliyor..." : "Doğrulama Başvurusu Gönder"}
        </button>

        {message && <div style={messageStyle}>{message}</div>}
      </section>

      <section style={cardStyle}>
        <h2 style={subTitleStyle}>Başvurularım</h2>

        {requests.length === 0 ? (
          <div style={emptyStyle}>Henüz doğrulama başvurunuz yok.</div>
        ) : (
          <div style={listStyle}>
            {requests.map((request) => (
              <div key={request.id} style={requestStyle}>
                <div>
                  <strong>{statusLabel(request.status)}</strong>
                  <div style={mutedStyle}>
                    {request.fileName || request.documentType || "Belge"}
                  </div>
                  <div style={mutedStyle}>
                    {new Date(request.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>

                <a
                  href={request.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={linkStyle}
                >
                  Belgeyi Gör
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 32,
} as const;

const cardStyle = {
  maxWidth: 900,
  margin: "0 auto 24px",
  background: "white",
  borderRadius: 24,
  padding: 28,
  border: "1px solid #e2e8f0",
} as const;

const titleStyle = {
  margin: "0 0 10px",
  fontSize: 34,
  fontWeight: 900,
} as const;

const subTitleStyle = {
  margin: "0 0 16px",
  fontSize: 24,
  fontWeight: 900,
} as const;

const descStyle = {
  color: "#475569",
  lineHeight: 1.7,
  marginBottom: 24,
} as const;

const formGridStyle = {
  display: "grid",
  gap: 16,
} as const;

const labelStyle = {
  display: "grid",
  gap: 8,
  fontWeight: 800,
  color: "#0f172a",
} as const;

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  boxSizing: "border-box",
} as const;

const buttonStyle = {
  marginTop: 20,
  border: "none",
  background: "#1d4ed8",
  color: "white",
  padding: "12px 18px",
  borderRadius: 12,
  fontWeight: 900,
  cursor: "pointer",
} as const;

const messageStyle = {
  marginTop: 16,
  padding: 12,
  borderRadius: 12,
  background: "#eff6ff",
  color: "#1d4ed8",
  fontWeight: 800,
} as const;

const emptyStyle = {
  color: "#64748b",
} as const;

const listStyle = {
  display: "grid",
  gap: 12,
} as const;

const requestStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 16,
} as const;

const mutedStyle = {
  color: "#64748b",
  marginTop: 4,
  fontSize: 14,
} as const;

const linkStyle = {
  color: "#2563eb",
  fontWeight: 800,
  textDecoration: "none",
} as const;
