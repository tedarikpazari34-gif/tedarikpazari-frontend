import { useRef, useState, type CSSProperties } from "react";
import SellerLayout from "../components/SellerLayout";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type ImportAction = "NEW" | "UPDATE" | "UNCHANGED" | "ERROR";
type ImportStatus =
  | "UPLOADED"
  | "VALIDATED"
  | "READY"
  | "IMPORTING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

type ImportJob = {
  id: string;
  source: "EXCEL" | "XML" | "API";
  status: ImportStatus;
  originalFileName: string | null;
  totalRows: number;
  readyRows: number;
  errorRows: number;
  newRows: number;
  updateRows: number;
  unchangedRows: number;
  processedRows: number;
  startedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  failureMessage?: string | null;
  createdAt: string;
  updatedAt?: string;
  batchProcessed?: number;
  remainingRows?: number;
};

type NormalizedRow = {
  sku?: string | null;
  title?: string | null;
  categoryPath?: string | null;
  unitType?: string | null;
  moq?: number | null;
  quantityStep?: number | null;
  basePrice?: number | null;
  stockQuantity?: number | null;
};

type ImportRow = {
  id: string;
  rowNumber: number;
  sku: string | null;
  action: ImportAction;
  productId: string | null;
  errors: unknown;
  normalized: NormalizedRow | null;
  processedAt: string | null;
};

type RowsResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  rows: ImportRow[];
};

const actionLabels: Record<ImportAction, string> = {
  NEW: "Yeni",
  UPDATE: "Güncellenecek",
  UNCHANGED: "Değişiklik Yok",
  ERROR: "Hatalı",
};

function getToken() {
  return localStorage.getItem("token");
}

async function readApiError(response: Response) {
  try {
    const data = await response.json();
    if (Array.isArray(data?.message)) return data.message.join(", ");
    return data?.message || "İşlem tamamlanamadı.";
  } catch {
    return "İşlem tamamlanamadı.";
  }
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function SellerProductBulkImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [rows, setRows] = useState<RowsResponse | null>(null);
  const [rowFilter, setRowFilter] = useState<ImportAction | "ALL">("ALL");
  const [busy, setBusy] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const authorizedFetch = async (
    path: string,
    options: RequestInit = {},
  ) => {
    const token = getToken();
    if (!token) throw new Error("Oturum bulunamadı. Lütfen yeniden giriş yapın.");

    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  const downloadFile = async (path: string, fileName: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await authorizedFetch(path);
      if (!response.ok) throw new Error(await readApiError(response));
      saveBlob(await response.blob(), fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dosya indirilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const loadRows = async (
    jobId: string,
    action: ImportAction | "ALL" = rowFilter,
    page = 1,
  ) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: "50",
    });
    if (action !== "ALL") query.set("action", action);

    const response = await authorizedFetch(
      `/products/bulk-import/jobs/${jobId}/rows?${query.toString()}`,
    );
    if (!response.ok) throw new Error(await readApiError(response));
    const data = (await response.json()) as RowsResponse;
    setRows(data);
    return data;
  };

  const uploadExcel = async () => {
    if (!selectedFile) {
      setError("Önce bir Excel dosyası seçin.");
      return;
    }
    if (!selectedFile.name.toLocaleLowerCase("tr-TR").endsWith(".xlsx")) {
      setError("Yalnızca .xlsx dosyaları kabul edilir.");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Excel dosyası en fazla 10 MB olabilir.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");
    setJob(null);
    setRows(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await authorizedFetch("/products/bulk-import/excel", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const createdJob = (await response.json()) as ImportJob;
      setJob(createdJob);
      setRowFilter("ALL");
      await loadRows(createdJob.id, "ALL", 1);
      setNotice(
        "Ön kontrol tamamlandı. Aşağıdaki sonuçları inceleyin; onay vermeden ürünleriniz değiştirilmez.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Excel dosyası yüklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const changeRowFilter = async (action: ImportAction | "ALL") => {
    if (!job) return;
    setBusy(true);
    setError("");
    setRowFilter(action);
    try {
      await loadRows(job.id, action, 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Satırlar yüklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const changePage = async (page: number) => {
    if (!job || !rows || page < 1 || page > rows.totalPages) return;
    setBusy(true);
    setError("");
    try {
      await loadRows(job.id, rowFilter, page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sayfa yüklenemedi.");
    } finally {
      setBusy(false);
    }
  };

  const confirmAndProcess = async () => {
    if (!job || (job.status !== "READY" && job.status !== "IMPORTING")) return;

    const changeCount = job.newRows + job.updateRows;
    const confirmed = window.confirm(
      `${changeCount} ürün satırı işlenecek. ` +
        `${job.errorRows} hatalı satır işleme alınmayacak. Devam etmek istiyor musunuz?`,
    );
    if (!confirmed) return;

    setProcessing(true);
    setError("");
    setNotice("");

    try {
      let currentJob = job;

      if (currentJob.status === "READY") {
        const confirmResponse = await authorizedFetch(
          `/products/bulk-import/jobs/${currentJob.id}/confirm`,
          { method: "POST" },
        );
        if (!confirmResponse.ok) {
          throw new Error(await readApiError(confirmResponse));
        }
        currentJob = (await confirmResponse.json()) as ImportJob;
        setJob(currentJob);
      }

      while (currentJob.status === "IMPORTING") {
        const response = await authorizedFetch(
          `/products/bulk-import/jobs/${currentJob.id}/process-next`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ batchSize: 100 }),
          },
        );
        if (!response.ok) throw new Error(await readApiError(response));

        currentJob = (await response.json()) as ImportJob;
        setJob(currentJob);

        if (currentJob.status === "COMPLETED") break;
        if (
          typeof currentJob.remainingRows === "number" &&
          currentJob.remainingRows <= 0
        ) {
          break;
        }
      }

      await loadRows(currentJob.id, rowFilter, 1);

      if (currentJob.status === "COMPLETED") {
        setNotice(
          `İçe aktarma tamamlandı. ${currentJob.totalRows} satır değerlendirildi: ${currentJob.totalRows - currentJob.errorRows} başarılı, ${currentJob.errorRows} hatalı.`,
        );
      } else {
        setNotice("İşlem durumu güncellendi.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Toplu ürün işlemi tamamlanamadı.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const resetImport = () => {
    if (processing) return;
    setSelectedFile(null);
    setJob(null);
    setRows(null);
    setRowFilter("ALL");
    setError("");
    setNotice("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const progress =
    job?.status === "COMPLETED"
      ? 100
      : job && job.totalRows > 0
        ? Math.min(100, Math.round((job.processedRows / job.totalRows) * 100))
        : 0;

  return (
    <SellerLayout title="Toplu Ürün Yönetimi">
      <main style={pageStyle}>
        <div style={topRowStyle}>
          <div>
            <a href="/seller/products" style={backLinkStyle}>
              ← Ürünlerime Dön
            </a>
            <h1 style={titleStyle}>Excel ile Toplu Ürün Yönetimi</h1>
            <p style={subtitleStyle}>
              Binlerce ürünü tek dosyada ön kontrolden geçirin, hataları görün ve
              yalnızca onayınızdan sonra ürünlerinizi ekleyin veya güncelleyin.
            </p>
          </div>
        </div>

        <section style={guideStyle}>
          <div style={stepStyle}><b>1</b><span>Şablonu indir veya mevcut ürünlerini dışa aktar.</span></div>
          <div style={stepStyle}><b>2</b><span>Excel'i doldur ve ön kontrol için yükle.</span></div>
          <div style={stepStyle}><b>3</b><span>Yeni, güncellenecek ve hatalı satırları incele.</span></div>
          <div style={stepStyle}><b>4</b><span>Onay ver; ürünler kontrollü gruplar halinde işlensin.</span></div>
        </section>

        <section style={panelStyle}>
          <div style={panelHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Excel Dosyaları</h2>
              <p style={sectionTextStyle}>
                Ürün ID sütununu değiştirmeyin. Görsel alanına HTTPS adresleri
                ekleyebilirsiniz. Birden fazla görseli | işaretiyle ayırabilirsiniz.
              </p>
            </div>
            <div style={buttonGroupStyle}>
              <button
                type="button"
                disabled={busy || processing}
                onClick={() =>
                  downloadFile(
                    "/products/bulk-import/template",
                    "nex-tedarik-pazari-urun-sablonu.xlsx",
                  )
                }
                style={secondaryButtonStyle}
              >
                Boş Şablonu İndir
              </button>
              <button
                type="button"
                disabled={busy || processing}
                onClick={() =>
                  downloadFile(
                    "/products/bulk-import/export",
                    "nex-tedarik-pazari-urunler.xlsx",
                  )
                }
                style={secondaryButtonStyle}
              >
                Mevcut Ürünleri Excel'e Aktar
              </button>
            </div>
          </div>

          <div style={uploadBoxStyle}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                setSelectedFile(file);
                setError("");
                setNotice("");
              }}
              disabled={busy || processing}
              style={fileInputStyle}
            />
            <div style={fileMetaStyle}>
              {selectedFile ? (
                <>
                  <strong>{selectedFile.name}</strong>
                  <span>{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </>
              ) : (
                <span>En fazla 10 MB, yalnızca .xlsx</span>
              )}
            </div>
            <button
              type="button"
              onClick={uploadExcel}
              disabled={!selectedFile || busy || processing}
              style={primaryButtonStyle}
            >
              {busy && !job ? "Ön Kontrol Yapılıyor..." : "Excel'i Ön Kontrole Gönder"}
            </button>
          </div>
        </section>

        {error && <div style={errorStyle}>{error}</div>}
        {notice && <div style={successStyle}>{notice}</div>}

        {job && (
          <>
            <section style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <h2 style={sectionTitleStyle}>Ön Kontrol Sonucu</h2>
                  <p style={sectionTextStyle}>
                    {job.originalFileName || "Excel dosyası"} · Durum:{" "}
                    <strong>{job.status}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetImport}
                  disabled={processing}
                  style={ghostButtonStyle}
                >
                  Yeni Dosya Seç
                </button>
              </div>

              <div style={statsGridStyle}>
                <Stat label="Toplam Satır" value={job.totalRows} />
                <Stat label="Yeni Ürün" value={job.newRows} />
                <Stat label="Güncellenecek" value={job.updateRows} />
                <Stat label="Değişiklik Yok" value={job.unchangedRows} />
                <Stat label="Hatalı" value={job.errorRows} />
                <Stat label="İşlenen" value={job.processedRows} />
              </div>

              {(job.status === "IMPORTING" || job.status === "COMPLETED") && (
                <div style={progressWrapStyle}>
                  <div style={progressLabelStyle}>
                    <span>İşlem ilerlemesi</span>
                    <strong>%{progress}</strong>
                  </div>
                  <div style={progressTrackStyle}>
                    <div style={{ ...progressBarStyle, width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div style={decisionRowStyle}>
                <div style={decisionTextStyle}>
                  {job.errorRows > 0 ? (
                    <span>
                      {job.errorRows} hatalı satır ürünlere uygulanmayacak. Hata
                      dosyasını indirip düzelterek daha sonra tekrar yükleyebilirsiniz.
                    </span>
                  ) : (
                    <span>Tüm satırlar ön kontrolden geçti.</span>
                  )}
                </div>
                <div style={buttonGroupStyle}>
                  {job.errorRows > 0 && (
                    <button
                      type="button"
                      disabled={busy || processing}
                      onClick={() =>
                        downloadFile(
                          `/products/bulk-import/jobs/${job.id}/errors.xlsx`,
                          `urun-import-hatalari-${job.id}.xlsx`,
                        )
                      }
                      style={dangerOutlineButtonStyle}
                    >
                      Hatalı Satırları İndir
                    </button>
                  )}
                  {(job.status === "READY" || job.status === "IMPORTING") && (
                    <button
                      type="button"
                      onClick={confirmAndProcess}
                      disabled={busy || processing}
                      style={primaryButtonStyle}
                    >
                      {processing
                        ? "Ürünler İşleniyor..."
                        : "Onayla ve Ürünleri İşle"}
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <div style={panelHeaderStyle}>
                <div>
                  <h2 style={sectionTitleStyle}>Satır Önizleme</h2>
                  <p style={sectionTextStyle}>
                    Excel satırlarını işlem türüne göre inceleyin.
                  </p>
                </div>
              </div>

              <div style={filtersStyle}>
                {(["ALL", "NEW", "UPDATE", "UNCHANGED", "ERROR"] as const).map(
                  (action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => changeRowFilter(action)}
                      disabled={busy || processing}
                      style={{
                        ...filterButtonStyle,
                        ...(rowFilter === action ? activeFilterButtonStyle : {}),
                      }}
                    >
                      {action === "ALL" ? "Tümü" : actionLabels[action]}
                    </button>
                  ),
                )}
              </div>

              {rows && rows.rows.length > 0 ? (
                <>
                  <div style={tableWrapStyle}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={thStyle}>Satır</th>
                          <th style={thStyle}>SKU</th>
                          <th style={thStyle}>Ürün</th>
                          <th style={thStyle}>Kategori</th>
                          <th style={thStyle}>Fiyat</th>
                          <th style={thStyle}>MOQ / Artış</th>
                          <th style={thStyle}>Durum</th>
                          <th style={thStyle}>Hata</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.rows.map((row) => {
                          const normalized = row.normalized || {};
                          const errorText = Array.isArray(row.errors)
                            ? row.errors.map(String).join(" · ")
                            : row.errors
                              ? String(row.errors)
                              : "—";
                          return (
                            <tr key={row.id}>
                              <td style={tdStyle}>{row.rowNumber}</td>
                              <td style={tdStyle}>{row.sku || normalized.sku || "—"}</td>
                              <td style={tdStyle}>{normalized.title || "—"}</td>
                              <td style={tdStyle}>{normalized.categoryPath || "—"}</td>
                              <td style={tdStyle}>
                                {normalized.basePrice ?? "—"}
                              </td>
                              <td style={tdStyle}>
                                {normalized.moq ?? "—"} /{" "}
                                {normalized.quantityStep ?? "—"}
                              </td>
                              <td style={tdStyle}>
                                <span style={actionBadgeStyle(row.action)}>
                                  {actionLabels[row.action]}
                                </span>
                              </td>
                              <td style={tdStyle}>{errorText}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div style={paginationStyle}>
                    <button
                      type="button"
                      disabled={busy || rows.page <= 1}
                      onClick={() => changePage(rows.page - 1)}
                      style={ghostButtonStyle}
                    >
                      Önceki
                    </button>
                    <span>
                      Sayfa {rows.page} / {Math.max(rows.totalPages, 1)} · {rows.total} satır
                    </span>
                    <button
                      type="button"
                      disabled={busy || rows.page >= rows.totalPages}
                      onClick={() => changePage(rows.page + 1)}
                      style={ghostButtonStyle}
                    >
                      Sonraki
                    </button>
                  </div>
                </>
              ) : (
                <div style={emptyStyle}>Bu filtrede gösterilecek satır yok.</div>
              )}
            </section>
          </>
        )}
      </main>
    </SellerLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={statStyle}>
      <span style={statLabelStyle}>{label}</span>
      <strong style={statValueStyle}>{value.toLocaleString("tr-TR")}</strong>
    </div>
  );
}

function actionBadgeStyle(action: ImportAction): CSSProperties {
  const variants: Record<ImportAction, CSSProperties> = {
    NEW: { background: "#dcfce7", color: "#166534" },
    UPDATE: { background: "#dbeafe", color: "#1e40af" },
    UNCHANGED: { background: "#f1f5f9", color: "#475569" },
    ERROR: { background: "#fee2e2", color: "#991b1b" },
  };
  return {
    display: "inline-flex",
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
    ...variants[action],
  };
}

const pageStyle: CSSProperties = { maxWidth: 1380, margin: "0 auto", padding: "24px" };
const topRowStyle: CSSProperties = { marginBottom: 20 };
const backLinkStyle: CSSProperties = { color: "#0f766e", fontWeight: 800, textDecoration: "none", fontSize: 14 };
const titleStyle: CSSProperties = { margin: "12px 0 8px", color: "#0f172a", fontSize: 30, lineHeight: 1.15 };
const subtitleStyle: CSSProperties = { margin: 0, color: "#64748b", maxWidth: 850, lineHeight: 1.6 };
const guideStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12, marginBottom: 18 };
const stepStyle: CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start", padding: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, color: "#334155", lineHeight: 1.45 };
const panelStyle: CSSProperties = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 18, padding: 20, marginBottom: 18, boxShadow: "0 8px 28px rgba(15,23,42,.05)" };
const panelHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" };
const sectionTitleStyle: CSSProperties = { margin: "0 0 6px", color: "#0f172a", fontSize: 20 };
const sectionTextStyle: CSSProperties = { margin: 0, color: "#64748b", lineHeight: 1.55, maxWidth: 760 };
const buttonGroupStyle: CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const primaryButtonStyle: CSSProperties = { border: 0, borderRadius: 10, padding: "11px 16px", background: "#0f766e", color: "#fff", fontWeight: 800, cursor: "pointer" };
const secondaryButtonStyle: CSSProperties = { border: "1px solid #0f766e", borderRadius: 10, padding: "10px 14px", background: "#fff", color: "#0f766e", fontWeight: 800, cursor: "pointer" };
const ghostButtonStyle: CSSProperties = { border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 13px", background: "#fff", color: "#334155", fontWeight: 750, cursor: "pointer" };
const dangerOutlineButtonStyle: CSSProperties = { border: "1px solid #dc2626", borderRadius: 10, padding: "10px 14px", background: "#fff", color: "#b91c1c", fontWeight: 800, cursor: "pointer" };
const uploadBoxStyle: CSSProperties = { marginTop: 18, padding: 18, border: "1px dashed #94a3b8", borderRadius: 14, background: "#f8fafc", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" };
const fileInputStyle: CSSProperties = { maxWidth: "100%" };
const fileMetaStyle: CSSProperties = { display: "flex", flexDirection: "column", gap: 3, color: "#475569", flex: "1 1 220px", fontSize: 13 };
const errorStyle: CSSProperties = { marginBottom: 18, padding: 14, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontWeight: 700 };
const successStyle: CSSProperties = { marginBottom: 18, padding: 14, borderRadius: 12, background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", fontWeight: 700 };
const statsGridStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 12, marginTop: 18 };
const statStyle: CSSProperties = { padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" };
const statLabelStyle: CSSProperties = { display: "block", color: "#64748b", fontSize: 12, fontWeight: 700, marginBottom: 6 };
const statValueStyle: CSSProperties = { color: "#0f172a", fontSize: 24 };
const progressWrapStyle: CSSProperties = { marginTop: 18 };
const progressLabelStyle: CSSProperties = { display: "flex", justifyContent: "space-between", color: "#334155", fontSize: 13, marginBottom: 7 };
const progressTrackStyle: CSSProperties = { height: 9, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" };
const progressBarStyle: CSSProperties = { height: "100%", background: "#0f766e", borderRadius: 999, transition: "width .2s ease" };
const decisionRowStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 18, paddingTop: 18, borderTop: "1px solid #e2e8f0" };
const decisionTextStyle: CSSProperties = { color: "#475569", flex: "1 1 360px", lineHeight: 1.5 };
const filtersStyle: CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 14px" };
const filterButtonStyle: CSSProperties = { border: "1px solid #cbd5e1", borderRadius: 999, padding: "8px 12px", background: "#fff", color: "#475569", fontWeight: 750, cursor: "pointer" };
const activeFilterButtonStyle: CSSProperties = { background: "#0f172a", borderColor: "#0f172a", color: "#fff" };
const tableWrapStyle: CSSProperties = { overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 12 };
const tableStyle: CSSProperties = { width: "100%", borderCollapse: "collapse", minWidth: 920 };
const thStyle: CSSProperties = { padding: "11px 12px", textAlign: "left", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 12, whiteSpace: "nowrap" };
const tdStyle: CSSProperties = { padding: "11px 12px", borderBottom: "1px solid #f1f5f9", color: "#334155", fontSize: 13, verticalAlign: "top" };
const paginationStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 14, color: "#64748b", fontSize: 13 };
const emptyStyle: CSSProperties = { padding: 24, textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: 12 };
