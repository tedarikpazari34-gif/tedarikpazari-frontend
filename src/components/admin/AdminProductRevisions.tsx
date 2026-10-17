import { useEffect, useRef, useState } from "react";

const API = "https://tedarik-backend.onrender.com/api";

type Revision = {
  id: string;
  productId: string;
  status: string;
  createdAt: string;
  proposedData: Record<string, unknown> | null;
  seller?: { name: string } | null;
  product?: {
    title?: string;
    category?: { name?: string } | null;
    brand?: { name?: string } | null;
    images?: Array<{ url: string }>;
    [key: string]: unknown;
  } | null;
};

const labels: Record<string, string> = {
  title: "Ürün adı",
  description: "Açıklama",
  categoryId: "Kategori",
  brandId: "Marka",
  imageUrl: "Kapak görseli",
  images: "Ürün görselleri",
  sku: "SKU",
  barcode: "Barkod",
  manufacturerCode: "Üretici kodu",
  unitType: "Birim",
  moq: "Minimum sipariş",
  quantityStep: "Miktar artış adımı",
  vatRate: "KDV oranı",
  leadTimeDays: "Hazırlama süresi",
  stockType: "Stok türü",
  sourceLanguage: "Kaynak dil",
  country: "Ülke",
  city: "Şehir",
  attributeValues: "Kategori özellikleri",
  variants: "Varyantlar",
};

async function errorMessage(response: Response) {
  try {
    const data = await response.json();
    return Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || "İşlem gerçekleştirilemedi.";
  } catch {
    return `Sunucu hatası (HTTP ${response.status})`;
  }
}

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "Boş";
  if (typeof value === "boolean") return value ? "Evet" : "Hayır";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "Değer görüntülenemedi";
    }
  }
  return String(value);
}

function existingValue(revision: Revision, field: string): unknown {
  const product = revision.product;
  if (!product) return undefined;

  if (field === "categoryId") {
    return product.category?.name || product.categoryId;
  }
  if (field === "brandId") {
    return product.brand?.name || product.brandId;
  }
  if (field === "images") {
    return product.images?.map((image) => image.url);
  }
  return product[field];
}

const buttonStyle = {
  border: "1px solid #0f766e",
  background: "#fff",
  color: "#0f766e",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
} as const;

export default function AdminProductRevisions() {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const operationRef = useRef(false);

  const fetchRevisions = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Oturum bulunamadı. Yeniden giriş yapın.");

    const response = await fetch(`${API}/admin/product-revisions/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(await errorMessage(response));

    const result: unknown = await response.json();
    if (!Array.isArray(result)) {
      throw new Error("Bekleyen revizyon listesi geçersiz.");
    }
    setRevisions(result as Revision[]);
  };

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Oturum bulunamadı. Yeniden giriş yapın.");
      setLoading(false);
      return;
    }

    fetch(`${API}/admin/product-revisions/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(await errorMessage(response));
        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Bekleyen revizyon listesi geçersiz.");
        }
        if (active) setRevisions(data as Revision[]);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Revizyonlar yüklenemedi.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const refresh = async () => {
    if (busyId) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      await fetchRevisions();
      setNotice("Bekleyen revizyon listesi yenilendi.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Liste yenilenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const decide = async (revision: Revision, action: "approve" | "reject") => {
    if (operationRef.current) return;

    const changes = revision.proposedData ?? {};
    const reason = (reasons[revision.id] ?? "").trim();

    if (action === "approve" && (
      !Object.keys(changes).length ||
      Object.prototype.hasOwnProperty.call(changes, "variants")
    )) {
      setError("Bu revizyon mevcut onaylama kurallarıyla uygulanamıyor.");
      return;
    }

    if (action === "reject" && (reason.length < 1 || reason.length > 1000)) {
      setError("Ret gerekçesi 1–1000 karakter arasında olmalıdır.");
      return;
    }

    const confirmed = window.confirm(
      action === "approve"
        ? `"${revision.product?.title || revision.productId}" için önerilen değişiklikler onaylanıp ürüne uygulanacak. Devam edilsin mi?`
        : `"${revision.product?.title || revision.productId}" revizyonu reddedilecek. Devam edilsin mi?`,
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Oturum bulunamadı. Yeniden giriş yapın.");
      return;
    }

    operationRef.current = true;
    setBusyId(revision.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API}/admin/product-revisions/${encodeURIComponent(revision.id)}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(action === "reject"
              ? { "Content-Type": "application/json" }
              : {}),
          },
          ...(action === "reject" ? { body: JSON.stringify({ reason }) } : {}),
        },
      );

      if (!response.ok) throw new Error(await errorMessage(response));

      setRevisions((items) => items.filter((item) => item.id !== revision.id));
      setExpandedId("");
      setNotice(
        action === "approve"
          ? "Revizyon onaylandı ve ürün değişiklikleri uygulandı."
          : "Revizyon reddedildi. Ret gerekçesi satıcının geçmişinde görünecek.",
      );

      try {
        await fetchRevisions();
      } catch {
        setNotice("İşlem tamamlandı. Güncel listeyi daha sonra yenileyebilirsiniz.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem tamamlanamadı.");
    } finally {
      operationRef.current = false;
      setBusyId("");
    }
  };

  return (
    <section style={{
      background: "#fff",
      border: "1px solid #cbd5e1",
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div>
          <h2 style={{ margin: "0 0 6px", color: "#0f172a" }}>
            Bekleyen Ürün Revizyonları
          </h2>
          <p style={{ margin: 0, color: "#64748b" }}>
            Satıcıların ürün içerik değişikliklerini inceleyin ve sonuçlandırın.
          </p>
        </div>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => void refresh()}
          disabled={loading || !!busyId}
        >
          {loading ? "Yükleniyor..." : "Listeyi Yenile"}
        </button>
      </div>

      {error && (
        <p role="alert" style={{ color: "#b91c1c", marginTop: 16 }}>
          {error}
        </p>
      )}
      {notice && (
        <p role="status" style={{ color: "#0f766e", marginTop: 16 }}>
          {notice}
        </p>
      )}

      {loading ? (
        <p style={{ color: "#64748b" }}>Revizyonlar yükleniyor...</p>
      ) : error && revisions.length === 0 ? null
        : revisions.length === 0 ? (
          <p style={{ color: "#64748b", marginTop: 18 }}>
            Bekleyen ürün revizyonu bulunmuyor.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            {revisions.map((revision) => {
              const fields = Object.entries(revision.proposedData ?? {});
              const unsupportedVariants = fields.some(([key]) => key === "variants");
              const expanded = expandedId === revision.id;

              return (
                <article key={revision.id} style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 16,
                  background: "#f8fafc",
                }}>
                  <strong style={{ color: "#0f172a" }}>
                    {revision.product?.title || "Ürün"}
                  </strong>
                  <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7 }}>
                    Satıcı: {revision.seller?.name || "—"}
                    {" · "}Talep: {new Date(revision.createdAt).toLocaleString("tr-TR")}
                    {" · "}{fields.length} değişiklik alanı
                  </p>

                  <button
                    type="button"
                    style={buttonStyle}
                    aria-expanded={expanded}
                    onClick={() => setExpandedId(expanded ? "" : revision.id)}
                  >
                    {expanded ? "İncelemeyi Kapat" : "Değişiklikleri İncele"}
                  </button>

                  {expanded && (
                    <div style={{ marginTop: 16 }}>
                      {fields.length === 0 ? (
                        <p>Revizyon değişiklik bilgisi bulunamadı.</p>
                      ) : fields.map(([field, proposed]) => (
                        <div key={field} style={{
                          border: "1px solid #e2e8f0",
                          background: "#fff",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 10,
                        }}>
                          <strong>{labels[field] || field}</strong>
                          <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: 12,
                            marginTop: 10,
                          }}>
                            <div>
                              <small style={{ color: "#64748b" }}>Mevcut değer</small>
                              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12 }}>
                                {displayValue(existingValue(revision, field))}
                              </pre>
                            </div>
                            <div>
                              <small style={{ color: "#0f766e" }}>Önerilen değer</small>
                              <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12 }}>
                                {displayValue(proposed)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}

                      {unsupportedVariants && (
                        <p role="alert" style={{ color: "#9a3412" }}>
                          Varyant içerik revizyonu henüz otomatik onaylanamıyor.
                          Bu talebi inceleyip gerekçeyle reddedebilirsiniz.
                          Varyant fiyat ve stok işlemleri ayrı kurallarla yönetilir.
                        </p>
                      )}

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
                        <button
                          type="button"
                          disabled={!!busyId || !fields.length || unsupportedVariants}
                          onClick={() => void decide(revision, "approve")}
                          style={{ ...buttonStyle, background: "#0f766e", color: "#fff" }}
                        >
                          {busyId === revision.id ? "İşleniyor..." : "Revizyonu Onayla"}
                        </button>
                      </div>

                      <label
                        htmlFor={`reject-reason-${revision.id}`}
                        style={{ display: "block", fontWeight: 700, marginTop: 18 }}
                      >
                        Ret gerekçesi
                      </label>
                      <textarea
                        id={`reject-reason-${revision.id}`}
                        value={reasons[revision.id] || ""}
                        maxLength={1000}
                        rows={3}
                        disabled={!!busyId}
                        onChange={(event) => setReasons((previous) => ({
                          ...previous,
                          [revision.id]: event.target.value,
                        }))}
                        placeholder="Satıcıya gösterilecek ret gerekçesini yazın."
                        style={{
                          width: "100%",
                          boxSizing: "border-box",
                          marginTop: 6,
                          padding: 12,
                          borderRadius: 10,
                          border: "1px solid #cbd5e1",
                        }}
                      />
                      <button
                        type="button"
                        disabled={!!busyId || !(reasons[revision.id] || "").trim()}
                        onClick={() => void decide(revision, "reject")}
                        style={{ ...buttonStyle, color: "#b91c1c", borderColor: "#b91c1c", marginTop: 8 }}
                      >
                        Gerekçeyle Reddet
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
            {revisions.length === 100 && (
              <p style={{ color: "#9a3412" }}>
                İlk 100 bekleyen revizyon gösteriliyor. İşlemlerden sonra listeyi yenileyin.
              </p>
            )}
          </div>
        )}
    </section>
  );
}
