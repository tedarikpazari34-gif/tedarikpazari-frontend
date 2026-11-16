import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import AdminSidebar from "../components/admin/AdminSidebar";

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type Order = {
  id: string;
  buyerId?: string | null;
  sellerId?: string | null;
  status?: string | null;
  createdAt?: string | null;
  totalAmount?: number | string | null;
  productTitleSnapshot?: string | null;
  product?: { title?: string | null } | null;
  shippingMethod?: "CARGO" | "FREIGHT" | null;
  shippingCompany?: string | null;
  shippingTrackingNo?: string | null;
  shippingDispatchNo?: string | null;
  shippedAt?: string | null;
};

const statuses = [
  "PENDING_PAYMENT",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

const card: CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 18,
};

const field: CSSProperties = {
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 9,
  background: "#fff",
  color: "#0f172a",
  minWidth: 0,
};

function dateText(value: string | null | undefined, locale: string) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleString(locale);
}

export default function AdminOrdersPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("tr") ? "tr-TR" : i18n.language;
  const tr = (key: string) => t(`adminOrdersPage.${key}`);
  const statusText = (value: string | null | undefined) =>
    value && statuses.some((item) => item === value)
      ? tr(`statusLabels.${value}`)
      : value || "-";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");


  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("adminOrdersPage.loadFailed"));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Orders request failed");
        }

        const data: unknown = await response.json();

        const raw: unknown = Array.isArray(data)
          ? data
          : data && typeof data === "object" && "data" in data
            ? (data as { data: unknown }).data
            : [];

        if (!Array.isArray(raw)) {
          throw new Error("Invalid orders response");
        }

        if (!controller.signal.aborted) {
          setOrders(raw as Order[]);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(t("adminOrdersPage.loadFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [t]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return orders.filter((order) => {
      if (status !== "ALL" && order.status !== status) return false;
      if (!query) return true;

      return [
        order.id,
        order.productTitleSnapshot,
        order.product?.title,
        order.shippingCompany,
        order.shippingTrackingNo,
        order.shippingDispatchNo,
      ].some((value) => String(value || "").toLocaleLowerCase().includes(query));
    });
  }, [orders, search, status]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedOrder(null);
      setDetailError("");
      setDetailLoading(false);
      return;
    }

    const controller = new AbortController();

    setSelectedOrder(null);
    setDetailError("");
    setDetailLoading(true);

    async function loadDetail() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Missing session");

        const response = await fetch(
          `${API}/orders/${encodeURIComponent(selectedId!)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          }
        );

        if (!response.ok) throw new Error("Detail request failed");

        const data: unknown = await response.json();

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          !("id" in data) ||
          data.id !== selectedId
        ) {
          throw new Error("Invalid detail response");
        }

        if (!controller.signal.aborted) {
          setSelectedOrder(data as Order);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSelectedOrder(null);
          setDetailError(t("adminOrdersPage.loadFailed"));
        }
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    void loadDetail();

    return () => controller.abort();
  }, [selectedId, t]);

  const detail = (label: string, value: string | number | null | undefined) => (
    <div style={{ marginBottom: 12, overflowWrap: "anywhere" }}>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <strong>{value ?? "-"}</strong>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, padding: "28px 20px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <h1 style={{ color: "#0f172a", marginTop: 0 }}>{tr("title")}</h1>
          <p style={{ color: "#64748b" }}>{tr("allOrders")}</p>

          <div style={{ ...card, display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <input
              aria-label={tr("search")}
              placeholder={tr("search")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...field, flex: "1 1 250px" }}
            />
            <select
              aria-label={tr("allStatuses")}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              style={{ ...field, flex: "0 1 240px" }}
            >
              <option value="ALL">{tr("allStatuses")}</option>
              {statuses.map((item) => (
                <option key={item} value={item}>{statusText(item)}</option>
              ))}
            </select>
          </div>

          {loading && <p role="status">{tr("loading")}</p>}
          {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}

          {!loading && !error && filtered.length === 0 && (
            <p>{tr("empty")}</p>
          )}

          {!loading && !error && (
            <div style={{ display: "grid", gap: 12 }}>
              {filtered.map((order) => (
                <article key={order.id} style={card}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ overflowWrap: "anywhere" }}>
                        {tr("orderNumber")}: {order.id}
                      </strong>
                      <div style={{ color: "#64748b", marginTop: 6 }}>
                        {order.productTitleSnapshot || order.product?.title || "-"}
                      </div>
                    </div>
                    <div>
                      <div>{tr("status")}: <strong>{statusText(order.status)}</strong></div>
                      <button
                        type="button"
                        onClick={() => setSelectedId(selectedId === order.id ? null : order.id)}
                        aria-expanded={selectedId === order.id}
                        style={{
                          ...field,
                          marginTop: 10,
                          color: "#0f766e",
                          cursor: "pointer",
                        }}
                      >
                        {selectedId === order.id ? tr("close") : tr("details")}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: 8, color: "#475569" }}>
                    {tr("date")}: {dateText(order.createdAt, locale)}
                    {" · "}
                    {tr("amount")}: {Number(order.totalAmount || 0).toLocaleString(locale)} ₺
                  </div>

                  {selectedId === order.id && detailLoading && (
                    <p role="status">{tr("loading")}</p>
                  )}

                  {selectedId === order.id && detailError && (
                    <p role="alert" style={{ color: "#b91c1c" }}>
                      {detailError}
                    </p>
                  )}

                  {selectedId === order.id &&
                    !detailLoading &&
                    !detailError &&
                    selectedOrder?.id === order.id && (
                    <section style={{
                      marginTop: 18,
                      paddingTop: 16,
                      borderTop: "1px solid #e2e8f0",
                    }}>
                      <h2 style={{ fontSize: 17 }}>{tr("shippingInfo")}</h2>
                      {detail(tr("buyer"), selectedOrder.buyerId)}
                      {detail(tr("seller"), selectedOrder.sellerId)}
                      {detail(tr("product"), selectedOrder.productTitleSnapshot || selectedOrder.product?.title)}

                      {!selectedOrder.shippedAt && !selectedOrder.shippingCompany ? (
                        <p>{tr("notShipped")}</p>
                      ) : (
                        <>
                          {detail(
                            tr("shippingInfo"),
                            selectedOrder.shippingMethod === "FREIGHT"
                              ? tr("freight") : tr("cargo")
                          )}
                          {detail(tr("carrier"), selectedOrder.shippingCompany)}
                          {detail(tr("trackingNo"), selectedOrder.shippingTrackingNo)}
                          {detail(tr("dispatchNo"), selectedOrder.shippingDispatchNo)}
                          {detail(tr("shippedAt"), dateText(selectedOrder.shippedAt, locale))}
                        </>
                      )}
                    </section>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
