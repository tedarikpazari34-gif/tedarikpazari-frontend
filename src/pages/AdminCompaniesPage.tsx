import { useEffect, useState, type CSSProperties } from "react";

const API = "https://tedarik-backend.onrender.com/api/admin";
const BACKEND = "https://tedarik-backend.onrender.com";

function resolveImageUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${BACKEND}${url.startsWith("/") ? "" : "/"}${url}`;
}

type Company = {
  id: string;
  name?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  taxNumber?: string | null;
  taxOffice?: string | null;
  website?: string | null;
  description?: string | null;
  createdAt?: string | null;
  role?: string | null;
  status?: string | null;
  verified?: boolean;
  address?: {
    address?: string;
    district?: string;
    companyType?: string;
    category?: string;
    fullName?: string;
  } | null;
  users?: {
    id?: string;
    role?: string;
    email?: string;
  }[];

  productCount?: number;
  approvedProductCount?: number;
  pendingProductCount?: number;
  lastProductAt?: string | null;

  products?: {
    id: string;
    title: string;
    imageUrl?: string | null;
    basePrice?: number | string | null;
    isApproved: boolean;
    createdAt?: string | null;
    images?: {
      url: string;
      isCover?: boolean;
    }[];
  }[];
};

function getRoleLabel(role?: string | null) {
  if (role === "BUYER") return "Alıcı";
  if (role === "SELLER") return "Satıcı";
  if (role === "LOGISTICS") return "Nakliyeci";
  if (role === "ADMIN") return "Admin";
  return role || "-";
}

function getStatusLabel(status?: string | null) {
  if (status === "PENDING") return "Bekliyor";
  if (status === "APPROVED") return "Onaylı";
  if (status === "BLOCKED") return "Bloklu";
  return status || "-";
}

function statusStyle(status?: string | null): CSSProperties {
  if (status === "APPROVED") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "BLOCKED") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#fef3c7",
    color: "#92400e",
  };
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Admin olarak giriş yapmalısınız");
        setCompanies([]);
        return;
      }

      const res = await fetch(`${API}/companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "Şirketler alınamadı");
        setCompanies([]);
        return;
      }

      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Şirketler alınamadı");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const approveCompany = async (id: string) => {
    try {
      setActionId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/companies/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Onaylanamadı");
        return;
      }

      await loadCompanies();
    } catch (err) {
      console.error(err);
      alert("İşlem hatası");
    } finally {
      setActionId("");
    }
  };

  const blockCompany = async (id: string) => {
    try {
      setActionId(id);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/companies/${id}/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Bloklanamadı");
        return;
      }

      await loadCompanies();
    } catch (err) {
      console.error(err);
      alert("İşlem hatası");
    } finally {
      setActionId("");
    }
  };

  const verifyCompany = async (id: string) => {
    try {
      setActionId(id);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/companies/${id}/verify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Firma doğrulanamadı");
        return;
      }

      await loadCompanies();

      setSelectedCompany((current) =>
        current?.id === id
          ? { ...current, verified: true }
          : current
      );
    } catch (err) {
      console.error(err);
      alert("Doğrulama işlemi başarısız");
    } finally {
      setActionId("");
    }
  };

  const unverifyCompany = async (id: string) => {
    try {
      setActionId(id);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/companies/${id}/unverify`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Doğrulama kaldırılamadı");
        return;
      }

      await loadCompanies();

      setSelectedCompany((current) =>
        current?.id === id
          ? { ...current, verified: false }
          : current
      );
    } catch (err) {
      console.error(err);
      alert("İşlem başarısız");
    } finally {
      setActionId("");
    }
  };

  const pendingCompanies = companies.filter(
    (c) => c.status === "PENDING"
  );

  const approvedCompanies = companies.filter(
    (c) => c.status === "APPROVED"
  );

  const blockedCompanies = companies.filter(
    (c) => c.status === "BLOCKED"
  );

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>
          Şirketler yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>ADMIN PANELİ</div>

          <h1 style={titleStyle}>Şirket Yönetimi</h1>

          <p style={descStyle}>
            Platforma kayıt olan şirketleri
            yönetin, onaylayın veya bloklayın.
          </p>
        </div>

        <div style={heroStatStyle}>
          <span>Toplam Şirket</span>
          <strong>{companies.length}</strong>
        </div>
      </section>

      {error && (
        <div style={errorCardStyle}>{error}</div>
      )}

      <section style={statsGridStyle}>
        <Stat
          label="Toplam Şirket"
          value={companies.length}
        />

        <Stat
          label="Bekleyen"
          value={pendingCompanies.length}
        />

        <Stat
          label="Onaylı"
          value={approvedCompanies.length}
        />

        <Stat
          label="Bloklu"
          value={blockedCompanies.length}
        />
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={eyebrowDarkStyle}>
            ONAY BEKLEYENLER
          </div>

          <h2 style={sectionTitleStyle}>
            Bekleyen Şirketler
          </h2>
        </div>

        {pendingCompanies.length === 0 ? (
          <div style={emptyInlineStyle}>
            Bekleyen şirket yok.
          </div>
        ) : (
          <div style={gridStyle}>
            {pendingCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                actionId={actionId}
                approveCompany={approveCompany}
                blockCompany={blockCompany}
              />
            ))}
          </div>
        )}
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={eyebrowDarkStyle}>
            TÜM ŞİRKETLER
          </div>

          <h2 style={sectionTitleStyle}>
            Şirket Listesi
          </h2>
        </div>

        <div style={tableStyle}>
          <div style={tableHeadStyle}>
            <span>Şirket</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Durum</span>
            <span>İşlem</span>
          </div>

          {companies.map((company) => {
            const role =
              company.role ||
              company.users?.[0]?.role ||
              "-";

            const isAdmin = role === "ADMIN";

            return (
              <div
                key={company.id}
                style={rowStyle}
              >
                <span style={companyNameStyle}>
                  {company.companyName ||
                    company.name ||
                    "İsimsiz şirket"}
                </span>

                <span>
                  {company.email ||
                    company.users?.[0]?.email ||
                    "-"}
                </span>

                <span>
                  {getRoleLabel(role)}
                </span>

                <span>
                  <span
                    style={{
                      ...badgeStyle,
                      ...statusStyle(company.status),
                    }}
                  >
                    {getStatusLabel(
                      company.status
                    )}
                  </span>
                </span>

                <span style={miniActionsStyle}>
                  <button
                    onClick={() => setSelectedCompany(company)}
                    style={detailButtonStyle}
                  >
                    Detay
                  </button>

                  {isAdmin ? (
                    <span style={adminBadgeStyle}>
                      Admin korunuyor
                    </span>
                  ) : company.status ===
                    "PENDING" ? (
                    <>
                      <button
                        onClick={() =>
                          approveCompany(company.id)
                        }
                        disabled={
                          actionId === company.id
                        }
                        style={
                          miniApproveButtonStyle
                        }
                      >
                        Onayla
                      </button>

                      <button
                        onClick={() =>
                          blockCompany(company.id)
                        }
                        disabled={
                          actionId === company.id
                        }
                        style={
                          miniBlockButtonStyle
                        }
                      >
                        Blokla
                      </button>
                    </>
                  ) : company.status ===
                    "APPROVED" ? (
                    <button
                      onClick={() =>
                        blockCompany(company.id)
                      }
                      disabled={
                        actionId === company.id
                      }
                      style={
                        miniBlockButtonStyle
                      }
                    >
                      Blokla
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        approveCompany(company.id)
                      }
                      disabled={
                        actionId === company.id
                      }
                      style={
                        miniApproveButtonStyle
                      }
                    >
                      Onayla
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {selectedCompany && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <div style={eyebrowDarkStyle}>FİRMA DETAYI</div>
                <h2 style={{ margin: 0 }}>
                  {selectedCompany.companyName ||
                    selectedCompany.name ||
                    "İsimsiz şirket"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                style={closeButtonStyle}
              >
                ✕
              </button>
            </div>

            <div style={detailGridStyle}>
              <Info
                label="Firma Adı"
                value={
                  selectedCompany.companyName ||
                  selectedCompany.name ||
                  "-"
                }
              />

              <Info
                label="Yetkili Kişi"
                value={selectedCompany.address?.fullName || "-"}
              />

              <Info
                label="Telefon"
                value={selectedCompany.phone || "-"}
              />

              <Info
                label="E-posta"
                value={
                  selectedCompany.email ||
                  selectedCompany.users?.[0]?.email ||
                  "-"
                }
              />

              <Info
                label="Rol"
                value={getRoleLabel(
                  selectedCompany.role ||
                    selectedCompany.users?.[0]?.role
                )}
              />

              <Info
                label="Kategori / Sektör"
                value={selectedCompany.address?.category || "-"}
              />

              <Info
                label="Şirket Türü"
                value={selectedCompany.address?.companyType || "-"}
              />

              <Info
                label="Şehir"
                value={selectedCompany.city || "-"}
              />

              <Info
                label="İlçe"
                value={selectedCompany.address?.district || "-"}
              />

              <Info
                label="Adres"
                value={selectedCompany.address?.address || "-"}
              />

              <Info
                label="Vergi No"
                value={selectedCompany.taxNumber || "-"}
              />

              <Info
                label="Vergi Dairesi"
                value={selectedCompany.taxOffice || "-"}
              />

              <Info
                label="Web Sitesi"
                value={selectedCompany.website || "-"}
              />

              <Info
                label="Kayıt Tarihi"
                value={
                  selectedCompany.createdAt
                    ? new Date(
                        selectedCompany.createdAt
                      ).toLocaleString("tr-TR")
                    : "-"
                }
              />

              <Info
                label="Durum"
                value={getStatusLabel(selectedCompany.status)}
              />


              <Info
                label="Firma Doğrulaması"
                value={
                  selectedCompany.verified
                    ? "✓ Doğrulanmış Firma"
                    : "Doğrulanmadı"
                }
              />
            </div>

            <div style={productsSectionStyle}>
              <div style={productsHeaderStyle}>
                <div>
                  <div style={eyebrowDarkStyle}>ÜRÜNLER</div>
                  <h3 style={{ margin: "4px 0 0" }}>
                    Firma Ürünleri ({selectedCompany.productCount || 0})
                  </h3>
                </div>

                <div style={productStatsStyle}>
                  <span>Onaylı: {selectedCompany.approvedProductCount || 0}</span>
                  <span>Bekleyen: {selectedCompany.pendingProductCount || 0}</span>
                </div>
              </div>

              {!selectedCompany.products?.length ? (
                <div style={emptyInlineStyle}>
                  Bu firma henüz ürün eklememiş.
                </div>
              ) : (
                <div style={productGridStyle}>
                  {selectedCompany.products.map((product) => {
                    const image =
                      product.images?.find((img) => img.isCover)?.url ||
                      product.images?.[0]?.url ||
                      product.imageUrl ||
                      "";

                    return (
                      <div key={product.id} style={productCardStyle}>
                        <div style={productImageBoxStyle}>
                          {image ? (
                            <img
                              src={resolveImageUrl(image)}
                              alt={product.title}
                              style={productImageStyle}
                            />
                          ) : (
                            <div style={productImageFallbackStyle}>
                              Görsel yok
                            </div>
                          )}
                        </div>

                        <div style={productBodyStyle}>
                          <strong style={productTitleStyle}>
                            {product.title}
                          </strong>

                          <div style={productPriceStyle}>
                            {Number(product.basePrice || 0).toLocaleString("tr-TR")} ₺
                          </div>

                          <span
                            style={{
                              ...productStatusStyle,
                              ...(product.isApproved
                                ? {
                                    background: "#dcfce7",
                                    color: "#166534",
                                  }
                                : {
                                    background: "#fef3c7",
                                    color: "#92400e",
                                  }),
                            }}
                          >
                            {product.isApproved ? "Onaylı" : "Onay Bekliyor"}
                          </span>

                          <div style={productDateStyle}>
                            {product.createdAt
                              ? new Date(product.createdAt).toLocaleString("tr-TR")
                              : "-"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCompany.role !== "ADMIN" && (
              <div style={{ ...actionsStyle, marginTop: 24 }}>
                {selectedCompany.verified ? (
                  <button
                    onClick={() => unverifyCompany(selectedCompany.id)}
                    disabled={actionId === selectedCompany.id}
                    style={unverifyButtonStyle}
                  >
                    Doğrulamayı Kaldır
                  </button>
                ) : (
                  <button
                    onClick={() => verifyCompany(selectedCompany.id)}
                    disabled={actionId === selectedCompany.id}
                    style={verifyButtonStyle}
                  >
                    ✓ Firmayı Doğrula
                  </button>
                )}
                {selectedCompany.status !== "APPROVED" && (
                  <button
                    onClick={async () => {
                      await approveCompany(selectedCompany.id);
                      setSelectedCompany(null);
                    }}
                    disabled={actionId === selectedCompany.id}
                    style={approveButtonStyle}
                  >
                    Onayla
                  </button>
                )}

                {selectedCompany.status !== "BLOCKED" && (
                  <button
                    onClick={async () => {
                      await blockCompany(selectedCompany.id);
                      setSelectedCompany(null);
                    }}
                    disabled={actionId === selectedCompany.id}
                    style={blockButtonStyle}
                  >
                    Blokla
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function CompanyCard({
  company,
  actionId,
  approveCompany,
  blockCompany,
}: {
  company: Company;
  actionId: string;
  approveCompany: (id: string) => void;
  blockCompany: (id: string) => void;
}) {
  const role =
    company.role ||
    company.users?.[0]?.role ||
    "-";

  const isAdmin = role === "ADMIN";

  return (
    <div style={cardStyle}>
      <div style={cardTopStyle}>
        <div>
          <div style={smallLabelStyle}>
            Şirket Başvurusu
          </div>

          <h3 style={cardTitleStyle}>
            {company.companyName ||
              company.name ||
              "İsimsiz şirket"}
          </h3>
        </div>

        <span
          style={{
            ...badgeStyle,
            ...statusStyle(company.status),
          }}
        >
          {getStatusLabel(company.status)}
        </span>
      </div>

      <div style={infoGridStyle}>
        <Info
          label="Email"
          value={
            company.email ||
            company.users?.[0]?.email ||
            "-"
          }
        />

        <Info
          label="Rol"
          value={getRoleLabel(role)}
        />
      </div>

      {!isAdmin ? (
        <div style={actionsStyle}>
          <button
            onClick={() =>
              approveCompany(company.id)
            }
            disabled={actionId === company.id}
            style={approveButtonStyle}
          >
            Onayla
          </button>

          <button
            onClick={() =>
              blockCompany(company.id)
            }
            disabled={actionId === company.id}
            style={blockButtonStyle}
          >
            Blokla
          </button>
        </div>
      ) : (
        <span style={adminBadgeStyle}>
          Admin korunuyor
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={statCardStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div style={infoBoxStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 40,
};

const heroStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  background:
    "linear-gradient(135deg, #020617, #1e3a8a)",
  color: "white",
  borderRadius: 28,
  padding: 32,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
};

const eyebrowStyle: CSSProperties = {
  color: "#93c5fd",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 40,
  fontWeight: 900,
};

const descStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  maxWidth: 720,
  lineHeight: 1.7,
};

const heroStatStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  padding: 20,
  borderRadius: 20,
  display: "grid",
  gap: 8,
  minWidth: 180,
};

const statsGridStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: 16,
};

const statCardStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 20,
  border: "1px solid #e2e8f0",
  display: "grid",
  gap: 8,
};

const sectionStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 24px",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 18,
};

const eyebrowDarkStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 900,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fill, minmax(320px, 1fr))",
  gap: 20,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #e2e8f0",
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: 12,
  marginBottom: 18,
};

const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 6,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
  color: "#0f172a",
};

const badgeStyle: CSSProperties = {
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const infoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 18,
};

const infoBoxStyle: CSSProperties = {
  background: "#f8fafc",
  borderRadius: 14,
  padding: 14,
  display: "grid",
  gap: 4,
};

const actionsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
};

const approveButtonStyle: CSSProperties = {
  border: "none",
  background: "#16a34a",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};

const blockButtonStyle: CSSProperties = {
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: "12px 16px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
};

const tableStyle: CSSProperties = {
  background: "white",
  borderRadius: 24,
  overflow: "hidden",
  border: "1px solid #e2e8f0",
};

const tableHeadStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "1.5fr 2fr 1fr 1fr 1.5fr",
  gap: 12,
  padding: 16,
  background: "#f8fafc",
  fontWeight: 900,
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "1.5fr 2fr 1fr 1fr 1.5fr",
  gap: 12,
  padding: 16,
  alignItems: "center",
  borderTop: "1px solid #e2e8f0",
};

const companyNameStyle: CSSProperties = {
  fontWeight: 800,
};

const miniActionsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const miniApproveButtonStyle: CSSProperties = {
  border: "none",
  background: "#16a34a",
  color: "white",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};

const miniBlockButtonStyle: CSSProperties = {
  border: "none",
  background: "#dc2626",
  color: "white",
  padding: "8px 10px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 800,
};

const adminBadgeStyle: CSSProperties = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "7px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
};

const emptyInlineStyle: CSSProperties = {
  background: "white",
  borderRadius: 20,
  padding: 24,
  border: "1px solid #e2e8f0",
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  background: "white",
  borderRadius: 24,
  padding: 32,
  border: "1px solid #e2e8f0",
};

const errorCardStyle: CSSProperties = {
  ...emptyCardStyle,
  color: "#991b1b",
  marginBottom: 24,
};
const detailButtonStyle: CSSProperties = {
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "8px 12px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  zIndex: 9999,
};

const modalStyle: CSSProperties = {
  width: "min(900px, 96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "white",
  borderRadius: 24,
  padding: 24,
  boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
};

const modalHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 20,
};

const closeButtonStyle: CSSProperties = {
  border: 0,
  background: "#f1f5f9",
  width: 38,
  height: 38,
  borderRadius: 12,
  cursor: "pointer",
  fontSize: 18,
};

const detailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const verifyButtonStyle: CSSProperties = {
  border: "none",
  background: "#0f766e",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 900,
};

const unverifyButtonStyle: CSSProperties = {
  border: "1px solid #94a3b8",
  background: "#f8fafc",
  color: "#334155",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 800,
};

const productsSectionStyle: CSSProperties = {
  marginTop: 26,
};

const productsHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  marginBottom: 16,
};

const productStatsStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  color: "#475569",
  fontSize: 13,
  fontWeight: 800,
};

const productGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
  gap: 16,
};

const productCardStyle: CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  overflow: "hidden",
  background: "#ffffff",
};

const productImageBoxStyle: CSSProperties = {
  width: "100%",
  height: 150,
  background: "#f8fafc",
  overflow: "hidden",
};

const productImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const productImageFallbackStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
  color: "#94a3b8",
  fontWeight: 800,
};

const productBodyStyle: CSSProperties = {
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const productTitleStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 15,
  lineHeight: 1.3,
};

const productPriceStyle: CSSProperties = {
  color: "#2563eb",
  fontWeight: 900,
  fontSize: 16,
};

const productStatusStyle: CSSProperties = {
  display: "inline-block",
  width: "fit-content",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
};

const productDateStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 11,
};
