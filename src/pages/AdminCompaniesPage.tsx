import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

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

function getRoleLabel(role: string | null | undefined, t: any) {
  if (role === "BUYER") return t("adminCompaniesPage.roleBuyer");
  if (role === "SELLER") return t("adminCompaniesPage.roleSeller");
  if (role === "LOGISTICS") return t("adminCompaniesPage.roleLogistics");
  if (role === "ADMIN") return t("adminCompaniesPage.roleAdmin");
  return role || "-";
}

function getStatusLabel(status: string | null | undefined, t: any) {
  if (status === "PENDING") return t("adminCompaniesPage.statusPending");
  if (status === "APPROVED") return t("adminCompaniesPage.statusApproved");
  if (status === "BLOCKED") return t("adminCompaniesPage.statusBlocked");
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

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
        setError(t("adminCompaniesPage.adminLoginRequired"));
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
        setError(data?.message || t("adminCompaniesPage.companiesLoadFailed"));
        setCompanies([]);
        return;
      }

      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(t("adminCompaniesPage.companiesLoadFailed"));
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
        alert(data?.message || t("adminCompaniesPage.approveFailed"));
        return;
      }

      await loadCompanies();
    } catch (err) {
      console.error(err);
      alert(t("adminCompaniesPage.actionError"));
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
        alert(data?.message || t("adminCompaniesPage.blockFailed"));
        return;
      }

      await loadCompanies();
    } catch (err) {
      console.error(err);
      alert(t("adminCompaniesPage.actionError"));
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
        alert(data?.message || t("adminCompaniesPage.verifyFailed"));
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
      alert(t("adminCompaniesPage.verifyActionFailed"));
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
        alert(data?.message || t("adminCompaniesPage.unverifyFailed"));
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
      alert(t("adminCompaniesPage.operationFailed"));
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
          {t("adminCompaniesPage.loading")}
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>{t("adminCompaniesPage.eyebrow")}</div>

          <h1 style={titleStyle}>{t("adminCompaniesPage.title")}</h1>

          <p style={descStyle}>
            {t("adminCompaniesPage.description")}
          </p>
        </div>

        <div style={heroStatStyle}>
          <span>{t("adminCompaniesPage.totalCompanies")}</span>
          <strong>{companies.length}</strong>
        </div>
      </section>

      {error && (
        <div style={errorCardStyle}>{error}</div>
      )}

      <section style={statsGridStyle}>
        <Stat
          label={t("adminCompaniesPage.totalCompanies")}
          value={companies.length}
        />

        <Stat
          label={t("adminCompaniesPage.pending")}
          value={pendingCompanies.length}
        />

        <Stat
          label={t("adminCompaniesPage.approved")}
          value={approvedCompanies.length}
        />

        <Stat
          label={t("adminCompaniesPage.blocked")}
          value={blockedCompanies.length}
        />
      </section>

      <section style={sectionStyle}>
        <div style={sectionHeaderStyle}>
          <div style={eyebrowDarkStyle}>
            {t("adminCompaniesPage.pendingEyebrow")}
          </div>

          <h2 style={sectionTitleStyle}>
            {t("adminCompaniesPage.pendingCompanies")}
          </h2>
        </div>

        {pendingCompanies.length === 0 ? (
          <div style={emptyInlineStyle}>
            {t("adminCompaniesPage.noPendingCompanies")}
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
            {t("adminCompaniesPage.allCompaniesEyebrow")}
          </div>

          <h2 style={sectionTitleStyle}>
            {t("adminCompaniesPage.companyList")}
          </h2>
        </div>

        <div style={tableStyle}>
          <div style={tableHeadStyle}>
            <span>{t("adminCompaniesPage.company")}</span>
            <span>{t("adminCompaniesPage.email")}</span>
            <span>{t("adminCompaniesPage.role")}</span>
            <span>{t("adminCompaniesPage.status")}</span>
            <span>{t("adminCompaniesPage.action")}</span>
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
                    t("adminCompaniesPage.unnamedCompany")}
                </span>

                <span>
                  {company.email ||
                    company.users?.[0]?.email ||
                    "-"}
                </span>

                <span>
                  {getRoleLabel(role, t)}
                </span>

                <span>
                  <span
                    style={{
                      ...badgeStyle,
                      ...statusStyle(company.status),
                    }}
                  >
                    {getStatusLabel(
                      company.status,
                      t
                    )}
                  </span>
                </span>

                <span style={miniActionsStyle}>
                  <button
                    onClick={() => setSelectedCompany(company)}
                    style={detailButtonStyle}
                  >
                    {t("adminCompaniesPage.detail")}
                  </button>

                  {isAdmin ? (
                    <span style={adminBadgeStyle}>
                      {t("adminCompaniesPage.adminProtected")}
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
                        {t("adminCompaniesPage.approve")}
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
                        {t("adminCompaniesPage.block")}
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
                      {t("adminCompaniesPage.block")}
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
                      {t("adminCompaniesPage.approve")}
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
                <div style={eyebrowDarkStyle}>
                  {t("adminCompaniesPage.companyDetail")}
                </div>
                <h2 style={{ margin: 0 }}>
                  {selectedCompany.companyName ||
                    selectedCompany.name ||
                    t("adminCompaniesPage.unnamedCompany")}
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
                label={t("adminCompaniesPage.companyName")}
                value={
                  selectedCompany.companyName ||
                  selectedCompany.name ||
                  "-"
                }
              />

              <Info
                label={t("adminCompaniesPage.authorizedPerson")}
                value={selectedCompany.address?.fullName || "-"}
              />

              <Info
                label={t("adminCompaniesPage.phone")}
                value={selectedCompany.phone || "-"}
              />

              <Info
                label={t("adminCompaniesPage.email")}
                value={
                  selectedCompany.email ||
                  selectedCompany.users?.[0]?.email ||
                  "-"
                }
              />

              <Info
                label={t("adminCompaniesPage.role")}
                value={getRoleLabel(
                  selectedCompany.role ||
                    selectedCompany.users?.[0]?.role,
                  t
                )}
              />

              <Info
                label={t("adminCompaniesPage.categorySector")}
                value={selectedCompany.address?.category || "-"}
              />

              <Info
                label={t("adminCompaniesPage.companyType")}
                value={selectedCompany.address?.companyType || "-"}
              />

              <Info
                label={t("adminCompaniesPage.city")}
                value={selectedCompany.city || "-"}
              />

              <Info
                label={t("adminCompaniesPage.district")}
                value={selectedCompany.address?.district || "-"}
              />

              <Info
                label={t("adminCompaniesPage.address")}
                value={selectedCompany.address?.address || "-"}
              />

              <Info
                label={t("adminCompaniesPage.taxNumber")}
                value={selectedCompany.taxNumber || "-"}
              />

              <Info
                label={t("adminCompaniesPage.taxOffice")}
                value={selectedCompany.taxOffice || "-"}
              />

              <Info
                label={t("adminCompaniesPage.website")}
                value={selectedCompany.website || "-"}
              />

              <Info
                label={t("adminCompaniesPage.registrationDate")}
                value={
                  selectedCompany.createdAt
                    ? new Date(
                        selectedCompany.createdAt
                      ).toLocaleString(locale)
                    : "-"
                }
              />

              <Info
                label={t("adminCompaniesPage.status")}
                value={getStatusLabel(selectedCompany.status, t)}
              />


              <Info
                label={t("adminCompaniesPage.companyVerification")}
                value={
                  selectedCompany.verified
                    ? t("adminCompaniesPage.verifiedCompany")
                    : t("adminCompaniesPage.notVerified")
                }
              />
            </div>

            <div style={{ margin: "20px 0" }}>
              <button
                onClick={async () => {
                  const content = window.prompt(
                    t("adminCompaniesPage.messagePrompt")
                  );

                  if (!content?.trim()) return;

                  try {
                    const token = localStorage.getItem("token");

                    const res = await fetch(
                      `https://tedarik-backend.onrender.com/api/chat/admin/company/${selectedCompany.id}/message`,
                      {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          content: content.trim(),
                        }),
                      }
                    );

                    const data = await res.json();

                    if (!res.ok) {
                      alert(data?.message || t("adminCompaniesPage.messageFailed"));
                      return;
                    }

                    alert(t("adminCompaniesPage.messageSuccess"));
                  } catch (err) {
                    console.error("ADMIN COMPANY MESSAGE ERROR:", err);
                    alert(t("adminCompaniesPage.messageFailed"));
                  }
                }}
                style={{
                  padding: "12px 18px",
                  borderRadius: "10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {t("adminCompaniesPage.sendMessage")}
              </button>
            </div>

            <div style={productsSectionStyle}>
              <div style={productsHeaderStyle}>
                <div>
                  <div style={eyebrowDarkStyle}>
                    {t("adminCompaniesPage.productsEyebrow")}
                  </div>
                  <h3 style={{ margin: "4px 0 0" }}>
                    {t("adminCompaniesPage.companyProducts", {
                      count: selectedCompany.productCount || 0,
                    })}
                  </h3>
                </div>

                <div style={productStatsStyle}>
                  <span>
                    {t("adminCompaniesPage.approvedProducts", {
                      count: selectedCompany.approvedProductCount || 0,
                    })}
                  </span>
                  <span>
                    {t("adminCompaniesPage.pendingProducts", {
                      count: selectedCompany.pendingProductCount || 0,
                    })}
                  </span>
                </div>
              </div>

              {!selectedCompany.products?.length ? (
                <div style={emptyInlineStyle}>
                  {t("adminCompaniesPage.noProducts")}
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
                              {t("adminCompaniesPage.noImage")}
                            </div>
                          )}
                        </div>

                        <div style={productBodyStyle}>
                          <strong style={productTitleStyle}>
                            {product.title}
                          </strong>

                          <div style={productPriceStyle}>
                            {Number(product.basePrice || 0).toLocaleString(locale)} ₺
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
                            {product.isApproved
                              ? t("adminCompaniesPage.approved")
                              : t("adminCompaniesPage.awaitingApproval")}
                          </span>

                          <div style={productDateStyle}>
                            {product.createdAt
                              ? new Date(product.createdAt).toLocaleString(locale)
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
                    {t("adminCompaniesPage.removeVerification")}
                  </button>
                ) : (
                  <button
                    onClick={() => verifyCompany(selectedCompany.id)}
                    disabled={actionId === selectedCompany.id}
                    style={verifyButtonStyle}
                  >
                    {t("adminCompaniesPage.verifyCompany")}
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
                    {t("adminCompaniesPage.approve")}
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
                    {t("adminCompaniesPage.block")}
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
  const { t } = useTranslation();

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
            {t("adminCompaniesPage.companyApplication")}
          </div>

          <h3 style={cardTitleStyle}>
            {company.companyName ||
              company.name ||
              t("adminCompaniesPage.unnamedCompany")}
          </h3>
        </div>

        <span
          style={{
            ...badgeStyle,
            ...statusStyle(company.status),
          }}
        >
          {getStatusLabel(company.status, t)}
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
          value={getRoleLabel(role, t)}
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
            {t("adminCompaniesPage.approve")}
          </button>

          <button
            onClick={() =>
              blockCompany(company.id)
            }
            disabled={actionId === company.id}
            style={blockButtonStyle}
          >
            {t("adminCompaniesPage.block")}
          </button>
        </div>
      ) : (
        <span style={adminBadgeStyle}>
          {t("adminCompaniesPage.adminProtected")}
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
