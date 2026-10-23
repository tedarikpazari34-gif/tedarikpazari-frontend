import { useEffect, useState, type CSSProperties, type FormEvent } from "react";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type XmlFeed = {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  syncIntervalMinutes: number;
  nextSyncAt: string;
  lastSyncStartedAt: string | null;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  lastError: string | null;
  lastJobId: string | null;
};

type FeedJob = {
  id: string;
  status: string;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  newRows: number;
  updateRows: number;
  unchangedRows: number;
};

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Oturum bulunamadı. Yeniden giriş yapın.");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    try {
      const data = await response.json();
      throw new Error(
        Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || "İşlem gerçekleştirilemedi.",
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Sunucudan geçerli bir yanıt alınamadı.");
      }
      throw error;
    }
  }

  return response.json() as Promise<T>;
}

function readableDate(value: string | null | undefined) {
  if (!value) return "Henüz yok";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("tr-TR");
}

function feedHost(value: string) {
  try {
    return new URL(value).hostname;
  } catch {
    return "Geçersiz adres";
  }
}

const box: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 20,
  marginBottom: 18,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: 11,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
};

const primary: CSSProperties = {
  padding: "11px 16px",
  borderRadius: 10,
  border: 0,
  background: "#0f766e",
  color: "#fff",
  fontWeight: 750,
  cursor: "pointer",
};

const secondary: CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #0f766e",
  background: "#fff",
  color: "#0f766e",
  fontWeight: 750,
  cursor: "pointer",
};

const intervals = [
  { minutes: 60, label: "Her saat" },
  { minutes: 180, label: "3 saatte bir" },
  { minutes: 360, label: "6 saatte bir" },
  { minutes: 720, label: "12 saatte bir" },
  { minutes: 1440, label: "Günde bir" },
  { minutes: 10080, label: "Haftada bir" },
];

export default function SellerXmlFeedManager() {
  const [feeds, setFeeds] = useState<XmlFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [jobs, setJobs] = useState<Record<string, FeedJob>>({});

  useEffect(() => {
    let mounted = true;
    void requestJson<XmlFeed[]>("/products/xml-feeds")
      .then((data) => {
        if (mounted) {
          if (!Array.isArray(data)) throw new Error("XML bağlantı listesi geçersiz.");
          setFeeds(data);
        }
      })
      .catch((err: unknown) => {
        if (mounted) setError(err instanceof Error ? err.message : "Bağlantılar alınamadı.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const reload = async () => {
    const data = await requestJson<XmlFeed[]>("/products/xml-feeds");
    if (!Array.isArray(data)) throw new Error("XML bağlantı listesi geçersiz.");
    setFeeds(data);
    return data;
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setUrl("");
    setIntervalMinutes(60);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (working) return;

    const cleanName = name.trim();
    const cleanUrl = url.trim();

    if (!cleanName || !cleanUrl.startsWith("https://")) {
      setError("Bağlantı adı ve HTTPS ile başlayan XML adresi zorunludur.");
      return;
    }

    const editingFeed = feeds.find((feed) => feed.id === editingId);
    if (
      editingFeed?.isActive &&
      !window.confirm(
        "Aktif bir XML bağlantısını değiştiriyorsunuz. Kaydettikten sonra otomatik senkronizasyon yeni ayarlara göre devam eder. Onaylıyor musunuz?",
      )
    ) return;

    setWorking("save");
    setError("");
    setNotice("");

    try {
      await requestJson<XmlFeed>(
        editingId
          ? `/products/xml-feeds/${encodeURIComponent(editingId)}`
          : "/products/xml-feeds",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: cleanName,
            url: cleanUrl,
            syncIntervalMinutes: intervalMinutes,
          }),
        },
      );
      await reload();
      setNotice(
        editingId
          ? "XML bağlantısı güncellendi."
          : "XML bağlantısı kaydedildi. Otomatik senkronizasyon kapalıdır; ayrıca etkinleştirmeniz gerekir.",
      );
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bağlantı kaydedilemedi.");
    } finally {
      setWorking(null);
    }
  };

  const toggleFeed = async (feed: XmlFeed) => {
    if (working) return;
    if (
      !window.confirm(
        feed.isActive
          ? `"${feed.name}" otomatik senkronizasyonunu durdurmak istiyor musunuz?`
          : `"${feed.name}" otomatik senkronizasyonunu etkinleştiriyorsunuz. Sistem belirlenen aralıklarla XML'i indirerek ayrıca onay istemeden güvenli ürün değişikliklerini uygular. Yeni ürünler ve içerik revizyonları yönetici onayına tabidir; fiyat ve stok güncellemeleri doğrudan uygulanabilir. Devam edilsin mi?`,
      )
    ) return;

    setWorking(feed.id);
    setError("");
    setNotice("");

    try {
      await requestJson<XmlFeed>(
        `/products/xml-feeds/${encodeURIComponent(feed.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !feed.isActive }),
        },
      );
      await reload();
      setNotice(feed.isActive ? "Otomatik senkronizasyon kapatıldı." : "Otomatik senkronizasyon etkinleştirildi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Durum güncellenemedi.");
    } finally {
      setWorking(null);
    }
  };

  const syncNow = async (feed: XmlFeed) => {
    if (working) return;
    if (
      !window.confirm(
        `"${feed.name}" şimdi senkronize edilecek. Ön kontrol hatası yoksa ürünler ayrıca onay istenmeden işlenir. İşlem sırasında hata olursa daha önce işlenen ürünlerde değişiklik yapılmış olabilir. Devam edilsin mi?`,
      )
    ) return;

    setWorking(feed.id);
    setError("");
    setNotice("Senkronizasyon çalışıyor. İşlem tamamlanana kadar bu sayfayı açık tutun.");

    try {
      await requestJson<XmlFeed>(
        `/products/xml-feeds/${encodeURIComponent(feed.id)}/sync`,
        { method: "POST" },
      );
      await reload();
      setNotice("XML senkronizasyonu tamamlandı. Son işlem bilgilerini kontrol edebilirsiniz.");
    } catch (err) {
      setError(
        (err instanceof Error ? err.message : "Senkronizasyon başarısız.") +
        " İşlem durumunu 'Listeyi Yenile' ile tekrar kontrol edebilirsiniz.",
      );
      try { await reload(); } catch { /* Asıl hatayı koru. */ }
    } finally {
      setWorking(null);
    }
  };

  const inspectJob = async (feed: XmlFeed) => {
    if (!feed.lastJobId || working) return;
    setWorking(feed.id);
    setError("");
    try {
      const job = await requestJson<FeedJob>(
        `/products/bulk-import/jobs/${encodeURIComponent(feed.lastJobId)}`,
      );
      setJobs((previous) => ({ ...previous, [feed.id]: job }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Son işlem yüklenemedi.");
    } finally {
      setWorking(null);
    }
  };

  const downloadErrors = async (feed: XmlFeed) => {
    if (!feed.lastJobId || working) return;
    setWorking(feed.id);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Oturum bulunamadı.");
      const response = await fetch(
        `${API_URL}/products/bulk-import/jobs/${encodeURIComponent(feed.lastJobId)}/errors.xlsx`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Hata dosyası indirilemedi.");
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `xml-senkron-hatalari-${feed.lastJobId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata dosyası indirilemedi.");
    } finally {
      setWorking(null);
    }
  };

  return (
    <section style={box}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: "0 0 7px", color: "#0f172a", fontSize: 21 }}>
            Otomatik XML Bağlantıları
          </h2>
          <p style={{ color: "#64748b", lineHeight: 1.6, margin: 0 }}>
            Tedarikçinizin HTTPS XML adresini ekleyerek fiyat, stok ve ürün bilgilerini belirlediğiniz aralıkta senkronize edin.
          </p>
        </div>
        <button
          type="button"
          style={secondary}
          disabled={!!working || loading}
          onClick={() => {
            setWorking("reload");
            setError("");
            setNotice("XML bağlantıları kontrol ediliyor...");
            void reload()
              .then((data) => {
                setNotice(`Liste yenilendi. ${data.length} XML bağlantısı bulundu.`);
              })
              .catch((err: unknown) => {
                setNotice("");
                setError(err instanceof Error ? err.message : "Liste yenilenemedi.");
              })
              .finally(() => setWorking(null));
          }}
        >
          {working === "reload" ? "Yenileniyor..." : "Listeyi Yenile"}
        </button>
      </div>

      <p style={{ color: "#9a3412", background: "#fff7ed", borderRadius: 10, padding: 13, lineHeight: 1.6 }}>
        <strong>Önemli:</strong> Otomatik senkronizasyonu etkinleştirdiğinizde her işlemde yeniden onayınız istenmez.
        Hatalı satırlar ön kontrolde tespit edilirse hiçbir değişiklik başlatılmaz.
        Otomatik XML en fazla 100 ürünü destekler. Ürün güncellemesi sırasında hata oluşursa değişikliklerin tamamı geri alınır.
        Yeni ürünler ve içerik revizyonları yönetici onayına tabidir.
      </p>

      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
      {notice && <p role="status" style={{ color: "#0f766e" }}>{notice}</p>}

      <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, alignItems: "end", marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6, color: "#334155", fontWeight: 650 }}>
          Bağlantı adı
          <input style={inputStyle} value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder="Örn. Ana tedarikçi XML" required disabled={!!working} />
        </label>
        <label style={{ display: "grid", gap: 6, color: "#334155", fontWeight: 650 }}>
          XML HTTPS adresi
          <input style={inputStyle} type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://ornek.com/urunler.xml" required disabled={!!working} />
        </label>
        <label style={{ display: "grid", gap: 6, color: "#334155", fontWeight: 650 }}>
          Senkronizasyon aralığı
          <select style={inputStyle} value={intervalMinutes} onChange={(e) => setIntervalMinutes(Number(e.target.value))} disabled={!!working}>
            {intervals.map((item) => (
              <option key={item.minutes} value={item.minutes}>{item.label}</option>
            ))}
          </select>
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="submit" style={primary} disabled={!!working}>
            {working === "save" ? "Kaydediliyor..." : editingId ? "Değişiklikleri Kaydet" : "Bağlantı Ekle"}
          </button>
          {editingId && (
            <button type="button" style={secondary} onClick={resetForm} disabled={!!working}>
              Vazgeç
            </button>
          )}
        </div>
      </form>

      <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
        {loading ? (
          <p>XML bağlantıları yükleniyor...</p>
        ) : feeds.length === 0 ? (
          <p style={{ color: "#64748b" }}>Henüz XML bağlantısı eklenmedi.</p>
        ) : feeds.map((feed) => {
          const failed = !!feed.lastError &&
            !!feed.lastFailureAt &&
            (!feed.lastSuccessAt || new Date(feed.lastFailureAt) > new Date(feed.lastSuccessAt));
          const job = jobs[feed.id];

          return (
            <article key={feed.id} style={{ border: "1px solid #cbd5e1", borderRadius: 14, padding: 16, background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ color: "#0f172a" }}>{feed.name}</strong>
                  <div style={{ fontSize: 13, color: "#64748b", overflowWrap: "anywhere", marginTop: 5 }}>
                    Kaynak alan adı: {feedHost(feed.url)} · Her {feed.syncIntervalMinutes} dakikada bir
                  </div>
                </div>
                <strong style={{ color: feed.isActive ? "#0f766e" : "#64748b" }}>
                  {feed.isActive ? "Otomatik: Açık" : "Otomatik: Kapalı"}
                </strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8, marginTop: 14, color: "#475569", fontSize: 13 }}>
                <span>Son başlangıç: {readableDate(feed.lastSyncStartedAt)}</span>
                <span>Son başarı: {readableDate(feed.lastSuccessAt)}</span>
                <span>Son hata: {readableDate(feed.lastFailureAt)}</span>
                <span>Planlanan sonraki işlem: {feed.isActive ? readableDate(feed.nextSyncAt) : "Kapalı"}</span>
              </div>
              {failed && (
                <p role="alert" style={{ color: "#991b1b", lineHeight: 1.5 }}>
                  Son senkronizasyon başarısız: {feed.lastError}
                </p>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                <button type="button" style={secondary} disabled={!!working} onClick={() => {
                  setEditingId(feed.id);
                  setName(feed.name);
                  setUrl(feed.url);
                  setIntervalMinutes(feed.syncIntervalMinutes);
                  setError("");
                  setNotice("Seçili bağlantıyı yukarıdaki formdan düzenleyebilirsiniz.");
                }}>Düzenle</button>
                <button type="button" style={secondary} disabled={!!working} onClick={() => void toggleFeed(feed)}>
                  {feed.isActive ? "Otomatiği Kapat" : "Otomatiği Aç"}
                </button>
                <button type="button" style={primary} disabled={!!working} onClick={() => void syncNow(feed)}>
                  {working === feed.id ? "İşleniyor..." : "Şimdi Senkronize Et"}
                </button>
                {feed.lastJobId && (
                  <button type="button" style={secondary} disabled={!!working} onClick={() => void inspectJob(feed)}>
                    Son İşlemi İncele
                  </button>
                )}
              </div>
              {job && (
                <div style={{ marginTop: 13, padding: 12, background: "#fff", borderRadius: 10, color: "#334155", lineHeight: 1.7 }}>
                  <strong>Son işlem: {job.status}</strong>
                  <div>
                    Toplam: {job.totalRows} · İşlenen: {job.processedRows} ·
                    Yeni: {job.newRows} · Güncelleme: {job.updateRows} ·
                    Değişmeyen: {job.unchangedRows} · Hatalı: {job.errorRows}
                  </div>
                  {job.errorRows > 0 && (
                    <button type="button" style={secondary} disabled={!!working} onClick={() => void downloadErrors(feed)}>
                      Hatalı Satırları Excel Olarak İndir
                    </button>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
