import { useEffect, useState } from "react";

const API = "https://tedarik-backend.onrender.com/api/admin";

type Company = {
  id: string;
  name?: string | null;
  companyName?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  users?: {
    id?: string;
    role?: string;
    email?: string;
  }[];
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token yok, admin olarak giriş yap");
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

  const pendingCompanies = companies.filter((c) => c.status === "PENDING");
  const approvedCompanies = companies.filter((c) => c.status === "APPROVED");
  const blockedCompanies = companies.filter((c) => c.status === "BLOCKED");

  if (loading) {
    return <main style={{ padding: 40 }}>Yükleniyor...</main>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Şirket Yönetimi</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={statsGrid}>
        <div style={statCard}>
          <p>Toplam Şirket</p>
          <h2>{companies.length}</h2>
        </div>

        <div style={statCard}>
          <p>Bekleyen</p>
          <h2>{pendingCompanies.length}</h2>
        </div>

        <div style={statCard}>
          <p>Onaylı</p>
          <h2>{approvedCompanies.length}</h2>
        </div>

        <div style={statCard}>
          <p>Bloklu</p>
          <h2>{blockedCompanies.length}</h2>
        </div>
      </div>

      <h2 style={{ marginTop: 36, marginBottom: 16 }}>Bekleyen Şirketler</h2>

      {pendingCompanies.length === 0 ? (
        <p>Bekleyen şirket yok.</p>
      ) : (
        <div style={grid}>
          {pendingCompanies.map((c) => (
            <CompanyCard
              key={c.id}
              company={c}
              actionId={actionId}
              approveCompany={approveCompany}
              blockCompany={blockCompany}
            />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 36, marginBottom: 16 }}>Tüm Şirketler</h2>

      {companies.length === 0 ? (
        <p>Şirket yok.</p>
      ) : (
        <div style={table}>
          <div style={{ ...row, fontWeight: 700, background: "#f8fafc" }}>
            <span>Şirket</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Durum</span>
            <span>İşlem</span>
          </div>

          {companies.map((c) => {
            const role = c.role || c.users?.[0]?.role || "-";
            const isAdmin = role === "ADMIN";

            return (
              <div key={c.id} style={row}>
                <span>{c.companyName || c.name || "İsimsiz şirket"}</span>
                <span>{c.email || "-"}</span>
                <span>{role}</span>
                <span>{c.status || "-"}</span>

                <span>
                  {c.status === "PENDING" && !isAdmin && (
                    <>
                      <button
                        onClick={() => approveCompany(c.id)}
                        disabled={actionId === c.id}
                        style={miniApproveButton}
                      >
                        {actionId === c.id ? "..." : "Onayla"}
                      </button>{" "}
                      <button
                        onClick={() => blockCompany(c.id)}
                        disabled={actionId === c.id}
                        style={miniBlockButton}
                      >
                        Blokla
                      </button>
                    </>
                  )}

                  {c.status === "APPROVED" && (
                    <>
                      <span style={approvedBadge}>Onaylı</span>{" "}
                      {!isAdmin && (
                        <button
                          onClick={() => blockCompany(c.id)}
                          disabled={actionId === c.id}
                          style={miniBlockButton}
                        >
                          Blokla
                        </button>
                      )}
                    </>
                  )}

                  {c.status === "BLOCKED" && !isAdmin && (
                    <button
                      onClick={() => approveCompany(c.id)}
                      disabled={actionId === c.id}
                      style={miniApproveButton}
                    >
                      Onayla
                    </button>
                  )}

                  {isAdmin && <span style={adminBadge}>Admin korunuyor</span>}
                </span>
              </div>
            );
          })}
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
  const role = company.role || company.users?.[0]?.role || "-";
  const isAdmin = role === "ADMIN";

  return (
    <div style={card}>
      <h3>{company.companyName || company.name || "İsimsiz şirket"}</h3>

      <p>
        <b>Email:</b> {company.email || "-"}
      </p>

      <p>
  <b>Rol:</b>{" "}
  <span>
    {role === "BUYER" && "Alıcı"}
    {role === "SELLER" && "Satıcı"}
    {role === "LOGISTICS" && "Nakliyeci"}
    {role === "ADMIN" && "Admin"}
  </span>
</p>

      <p>
        <b>Durum:</b> {company.status || "-"}
      </p>

      {!isAdmin ? (
        <div style={actions}>
          <button
            onClick={() => approveCompany(company.id)}
            disabled={actionId === company.id}
            style={approveButton}
          >
            {actionId === company.id ? "İşleniyor..." : "Onayla"}
          </button>

          <button
            onClick={() => blockCompany(company.id)}
            disabled={actionId === company.id}
            style={blockButton}
          >
            Blokla
          </button>
        </div>
      ) : (
        <span style={adminBadge}>Admin korunuyor</span>
      )}
    </div>
  );
}

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

const statCard: React.CSSProperties = {
  background: "#0f172a",
  color: "white",
  borderRadius: 12,
  padding: 20,
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 16,
};

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 20,
  background: "white",
};

const actions: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginTop: 16,
};

const approveButton: React.CSSProperties = {
  padding: "10px 14px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const blockButton: React.CSSProperties = {
  padding: "10px 14px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};

const table: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  overflow: "hidden",
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1.5fr",
  gap: 12,
  padding: 14,
  borderBottom: "1px solid #e5e7eb",
  alignItems: "center",
};

const miniApproveButton: React.CSSProperties = {
  padding: "7px 10px",
  background: "#16a34a",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const miniBlockButton: React.CSSProperties = {
  padding: "7px 10px",
  background: "#dc2626",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
};

const approvedBadge: React.CSSProperties = {
  color: "#16a34a",
  background: "#dcfce7",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
};

const adminBadge: React.CSSProperties = {
  color: "#2563eb",
  background: "#dbeafe",
  padding: "4px 8px",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
};