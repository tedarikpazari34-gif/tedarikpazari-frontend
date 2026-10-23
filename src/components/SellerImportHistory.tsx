import { useState, type CSSProperties } from "react";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type Job = {
  id: string;
  source: string;
  status: string;
  originalFileName: string | null;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  createdAt: string;
};

type History = {
  jobs: Job[];
  total: number;
  page: number;
  totalPages: number;
};

type Props = {
  onOpen: (jobId: string) => void | Promise<void>;
  onDownloadErrors: (jobId: string) => void | Promise<void>;
};

const panel: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 20,
  marginBottom: 18,
};

const button: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #0f766e",
  background: "#fff",
  color: "#0f766e",
  fontWeight: 700,
  cursor: "pointer",
};

const labels: Record<string, string> = {
  READY: "Onay bekliyor",
  VALIDATED: "Ön kontrol tamamlandı",
  IMPORTING: "İşleniyor",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
  CANCELLED: "İptal edildi",
  UPLOADED: "Yüklendi",
};

export default function SellerImportHistory({
  onOpen,
  onDownloadErrors,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadPage = async (page: number) => {
    setLoading(true);
    setError("");
    setHistory(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Lütfen yeniden giriş yapın.");

      const response = await fetch(
        `${API}/products/bulk-import/jobs?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Yükleme geçmişi servisi bulunamadı (404). API bağlantısını kontrol edin."
            : "Yükleme geçmişi alınamadı.",
        );
      }

      const data = (await response.json()) as History;
      if (!data || !Array.isArray(data.jobs)) {
        throw new Error("Geçmiş kayıtlarının biçimi geçersiz.");
      }
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={panel}>
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>
            Excel / XML Yükleme Geçmişi
          </h2>
          <p style={{ margin: 0, color: "#64748b" }}>
            Önceki yüklemelerinizi ve işlem sonuçlarını inceleyin.
          </p>
        </div>
        <button type="button" style={button} onClick={() => {
          if (visible) setVisible(false);
          else {
            setVisible(true);
            void loadPage(1);
          }
        }}>
          {visible ? "Geçmişi Kapat" : "Yükleme Geçmişini Göster"}
        </button>
      </div>

      {visible && (
        <div style={{ marginTop: 18 }}>
          {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
          {loading && <p>Yükleme geçmişi getiriliyor...</p>}
          {!loading && history && (
            <>
              <p style={{ color: "#64748b", fontSize: 14 }}>
                Toplam {history.total} yükleme kaydı
              </p>
              <div style={{ display: "grid", gap: 10 }}>
                {history.jobs.map((job) => (
                  <article key={job.id} style={{
                    padding: 14, border: "1px solid #cbd5e1",
                    borderRadius: 12, background: "#f8fafc",
                  }}>
                    <strong style={{ color: "#0f172a", overflowWrap: "anywhere" }}>
                      {job.originalFileName || "İsimsiz dosya"}
                    </strong>
                    <p style={{ color: "#475569", margin: "7px 0" }}>
                      {job.source} · {labels[job.status] || job.status}
                      {" · "}
                      {new Date(job.createdAt).toLocaleString("tr-TR")}
                    </p>
                    <p style={{ color: "#475569", margin: "7px 0" }}>
                      Toplam: {job.totalRows} · İşlenen: {job.processedRows}
                      {" · "}Hatalı: {job.errorRows}
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button type="button" style={button}
                        onClick={() => void onOpen(job.id)}>
                        Ayrıntıları Aç
                      </button>
                      {job.errorRows > 0 && (
                        <button type="button" style={button}
                          onClick={() => void onDownloadErrors(job.id)}>
                          Hata Raporunu İndir
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {history.jobs.length === 0 && <p>Henüz yükleme kaydı yok.</p>}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button type="button" style={button}
                  disabled={loading || history.page <= 1}
                  onClick={() => void loadPage(history.page - 1)}>
                  Önceki
                </button>
                <span style={{ alignSelf: "center" }}>
                  {history.page} / {Math.max(1, history.totalPages)}
                </span>
                <button type="button" style={button}
                  disabled={loading || history.page >= history.totalPages}
                  onClick={() => void loadPage(history.page + 1)}>
                  Sonraki
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
