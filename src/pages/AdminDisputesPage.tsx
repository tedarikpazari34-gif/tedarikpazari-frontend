import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../components/admin/AdminSidebar";

const API = "https://tedarik-backend.onrender.com/api";

export default function AdminDisputesPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const token = localStorage.getItem("token");

  async function loadDisputes() {
    try {
      const res = await fetch(`${API}/disputes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function resolveDispute(
    id: string,
    resolution: "REFUND_BUYER" | "RELEASE_SELLER",
  ) {
    try {
      await fetch(`${API}/disputes/${id}/resolve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resolution,
        }),
      });

      loadDisputes();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadDisputes();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "ALL") return disputes;

    return disputes.filter((d) => d.status === filter);
  }, [disputes, filter]);

  const badge = (status: string) => {
    const map: Record<string, any> = {
      OPEN: {
        bg: "#FEF3C7",
        color: "#92400E",
        text: t("adminDisputesPage.statusOpen"),
      },
      RESOLVED: {
        bg: "#DCFCE7",
        color: "#166534",
        text: t("adminDisputesPage.statusResolved"),
      },
      CLOSED: {
        bg: "#E2E8F0",
        color: "#334155",
        text: t("adminDisputesPage.statusClosed"),
      },
    };

    const item = map[status] || map.OPEN;

    return (
      <span
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          background: item.bg,
          color: item.color,
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        {item.text}
      </span>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        background: "#f4f7fb",
      }}
    >
      <AdminSidebar />

      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          padding: 40,
        }}
      >
        <h1
          style={{
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          {t("adminDisputesPage.title")}
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: 30,
          }}
        >
          {t("adminDisputesPage.description")}
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 25,
          }}
        >
          {["ALL", "OPEN", "RESOLVED"].map((x) => (
            <button
              key={x}
              onClick={() => setFilter(x)}
              style={{
                border: "none",
                padding: "10px 18px",
                borderRadius: 999,
                cursor: "pointer",
                background: filter === x ? "#2563eb" : "#fff",
                color: filter === x ? "#fff" : "#111827",
                fontWeight: 600,
              }}
            >
              {x === "ALL"
                ? t("adminDisputesPage.filterAll")
                : x === "OPEN"
                  ? t("adminDisputesPage.statusOpen")
                  : t("adminDisputesPage.statusResolved")}
            </button>
          ))}
        </div>

        {loading ? (
          <div>{t("adminDisputesPage.loading")}</div>
        ) : filtered.length === 0 ? (
          <div>{t("adminDisputesPage.empty")}</div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 20,
            }}
          >
            {filtered.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: 24,
                  boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {item.reason}
                  </h2>

                  {badge(item.status)}
                </div>

                <div style={{ marginTop: 20 }}>
                  <strong>{t("adminDisputesPage.buyer")}</strong>{" "}
                  {item.buyerCompany?.name ||
                    item.order?.buyerCompany?.name ||
                    item.order?.buyer?.name ||
                    "-"}
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>{t("adminDisputesPage.seller")}</strong>{" "}
                  {item.sellerCompany?.name ||
                    item.order?.sellerCompany?.name ||
                    item.order?.seller?.name ||
                    "-"}
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>{t("adminDisputesPage.order")}</strong>{" "}
                  {item.order?.id || "-"}
                </div>

                <div style={{ marginTop: 8 }}>
                  <strong>{t("adminDisputesPage.createdAt")}</strong>{" "}
                  {new Date(item.createdAt).toLocaleString(locale)}
                </div>

                <div style={{ marginTop: 16 }}>
                  <strong>{t("adminDisputesPage.descriptionLabel")}</strong>

                  <p
                    style={{
                      marginTop: 8,
                      color: "#475569",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {Array.isArray(item.files) && item.files.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <strong>{t("adminDisputesPage.attachments")}</strong>

                    <div
                      style={{
                        display: "grid",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {item.files.map((file: any) => (
                        <a
                          key={file.id || file.url}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#2563eb",
                            textDecoration: "underline",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {file.originalName ||
                            file.filename ||
                            file.name ||
                            t("adminDisputesPage.viewFile")}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {item.resolution && (
                  <div
                    style={{
                      marginTop: 12,
                      color: "#2563eb",
                      fontWeight: 700,
                    }}
                  >
                    {t("adminDisputesPage.resolution")}{" "}
                    {item.resolution === "REFUND_BUYER"
                      ? t("adminDisputesPage.resolutionRefundBuyer")
                      : item.resolution === "RELEASE_SELLER"
                        ? t("adminDisputesPage.resolutionReleaseSeller")
                        : item.resolution}
                  </div>
                )}

                {item.status === "OPEN" && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 20,
                    }}
                  >
                    <button
                      onClick={() => resolveDispute(item.id, "REFUND_BUYER")}
                      style={{
                        background: "#dc2626",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {t("adminDisputesPage.refundBuyer")}
                    </button>

                    <button
                      onClick={() => resolveDispute(item.id, "RELEASE_SELLER")}
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        border: "none",
                        padding: "12px 20px",
                        borderRadius: 12,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      {t("adminDisputesPage.releaseSeller")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
