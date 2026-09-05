import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import OrderList from "../components/OrderList";
import QuoteList from "../components/QuoteList";
import DisputeList from "../components/DisputeList";
import RFQList from "../components/RFQList";
import CategorySidebar from "../components/CategorySidebar";
import DashboardStats from "../components/DashboardStats";
import ProductCreateForm from "../components/ProductCreateForm";
import ProductGrid from "../components/ProductGrid";
import RFQMarketplace from "../components/RFQMarketplace";
import { authFetch } from "../api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

const APP_TITLE = import.meta.env.VITE_PLATFORM_NAME || "TEDARİK PAZARI";

axios.defaults.baseURL = API_BASE_URL;

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
}

interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string | null;
  basePrice: number | string;
  moq: number;
  unitType: string;
  leadTimeDays?: number | null;
  images?: {
    url: string;
  }[];
  seller?: {
    id: string;
    name: string;
    verified?: boolean;
    status?: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

interface Quote {
  id: string;
  rfqId?: string;
  unitPrice?: string | number;
  price?: string | number;
  deliveryDays?: number;
  sellerNote?: string;
  status: string;
  rfq?: {
    id?: string;
  };
}

interface RFQ {
  id: string;
  productId?: string;
  quantity: number;
  note?: string;
  status: string;
  product?: {
    title?: string;
  };
  buyer?: {
    name?: string;
  };
}

interface OrderItem {
  id: string;
  rfqId: string;
  quoteId: string;
  totalAmount: string;
  commissionAmount: string;
  escrowAmount: string;
  status: string;
  rfq?: {
    id?: string;
    quantity?: number;
    product?: {
      title?: string;
    };
  };
  quote?: {
    id?: string;
    unitPrice?: string | number;
    deliveryDays?: number;
  };
}

interface DisputeItem {
  id: string;
  orderId: string;
  reason: string;
  description?: string;
  status: string;
}

function resolveAssetUrl(path?: string | null) {
  if (!path) return "https://placehold.co/800x600?text=No+Image";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) {
    const origin = API_BASE_URL.replace("/api", "");
    return `${origin}${path}`;
  }
  return path;
}

export default function PanelPage() {
  const { t } = useTranslation();

  const getStoredToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const getStoredRole = () =>
    typeof window !== "undefined" ? localStorage.getItem("role") || "" : "";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [email, setEmail] = useState("buyer@test.com");
  const [password, setPassword] = useState("123456");

  const [token, setToken] = useState<string>(getStoredToken());
  const [role, setRole] = useState<string>(getStoredRole());

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [openRfqs, setOpenRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);

  const [searchText, setSearchText] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuoteRfq, setSelectedQuoteRfq] = useState<RFQ | null>(null);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteDays, setQuoteDays] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const [rfqProduct, setRfqProduct] = useState<Product | null>(null);
  const [rfqQuantity, setRfqQuantity] = useState(100);
  const [rfqNote, setRfqNote] = useState("");

  const [adminCompanies, setAdminCompanies] = useState<any[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<any>(null);
  const [adminTimeseries, setAdminTimeseries] = useState<any>(null);
  const [adminLedger, setAdminLedger] = useState<any[]>([]);
  const [adminPendingProducts, setAdminPendingProducts] = useState<any[]>([]);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedRole = getStoredRole();

    if (storedToken && !token) setToken(storedToken);
    if (storedRole && !role) setRole(storedRole);
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common.Authorization;
    }
  }, [token]);

  useEffect(() => {
    loadProducts();

    axios
      .get("/categories/tree")
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error(t("panelPage.errors.categoryLoad"), err);
      });
  }, []);

  const authHeaders = () => {
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${storedToken}`,
    };
  };

  async function loadProducts(categoryId?: string, q?: string) {
    try {
      if (categoryId !== undefined) {
        setSelectedCategory(categoryId || null);
      }

      let url = "/products";

      if (categoryId) {
        url = `/products/category/${categoryId}`;
      } else if (q) {
        url = `/products?q=${encodeURIComponent(q)}`;
      }

      const r = await axios.get(url);
      setProducts(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error(t("panelPage.errors.productLoad"), err);
      alert(t("panelPage.errors.productLoad"));
    }
  }

  const login = async () => {
    try {
      const res = await axios.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const newToken =
        res.data?.token ||
        res.data?.access_token ||
        res.data?.data?.token ||
        "";

      const newRole =
        res.data?.user?.role ||
        res.data?.role ||
        res.data?.data?.user?.role ||
        "";

      if (!newToken) {
        alert(t("panelPage.errors.noToken"));
        return;
      }

      localStorage.setItem("token", newToken);
      localStorage.setItem("role", newRole);

      setToken(newToken);
      setRole(newRole);

      alert(t("panelPage.errors.loginSuccess"));
    } catch (err: any) {
      console.error(err);
      alert(JSON.stringify(err?.response?.data || err.message || t("panelPage.errors.loginError")));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setToken("");
    setRole("");
    setRfqs([]);
    setOpenRfqs([]);
    setQuotes([]);
    setOrders([]);
    setDisputes([]);
    setAdminCompanies([]);
    setAdminMetrics(null);
    setAdminTimeseries(null);
    setAdminLedger([]);
    setAdminPendingProducts([]);
  };

  const searchProducts = () => {
    loadProducts(selectedCategory || undefined, searchText.trim() || undefined);
  };

  const submitRFQ = async () => {
    if (!rfqProduct) return;

    try {
      const res = await fetch(`${API_BASE_URL}/rfqs`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          productId: rfqProduct.id,
          quantity: rfqQuantity,
          note: rfqNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.rfqSent"));

      setRfqProduct(null);
      setRfqQuantity(100);
      setRfqNote("");

      loadMyRFQs();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.rfqError"));
    }
  };

  const loadMyRFQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rfqs/mine`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setRfqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.rfqLoadError"));
    }
  };

  const loadOpenRFQs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rfqs/open`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setOpenRfqs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.openRfqLoadError"));
    }
  };

  const sendQuote = async (
    rfqId: string,
    unitPrice: number,
    deliveryDays: number,
    sellerNote: string
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/quotes`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          rfqId,
          unitPrice,
          deliveryDays,
          sellerNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.quoteSent"));
      loadQuotes();
      loadOpenRFQs();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.quoteSendError"));
    }
  };

  const loadQuotes = async () => {
    try {
      const currentRole = role || getStoredRole();

      const url =
        currentRole === "SELLER"
          ? `${API_BASE_URL}/quotes/mine`
          : `${API_BASE_URL}/quotes/buyer`;

      const res = await fetch(url, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.quoteLoadError"));
    }
  };

  const acceptQuote = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/from-quote/${id}`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.orderCreated"));
      loadQuotes();
      loadOrders();
      loadMyRFQs();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.quoteAcceptError"));
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setOrders(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
          ? data.data
          : []
      );
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.orderLoadError"));
    }
  };

  const payOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/pay`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.paymentSuccess"));
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.paymentError"));
    }
  };

  const prepareOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/prepare`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.preparingSuccess"));
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.preparingError"));
    }
  };

  const shipOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/ship`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.shippedSuccess"));
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.shippedError"));
    }
  };

  const completeOrder = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${id}/complete`, {
        method: "POST",
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.completedSuccess"));
      loadOrders();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.completedError"));
    }
  };

  const loadDisputes = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/disputes/mine`, {
        headers: authHeaders(),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setDisputes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.disputeLoadError"));
    }
  };

  const openDispute = async (orderId: string) => {
    const reason = prompt(t("panelPage.errors.disputeReason"));
    if (!reason) return;

    try {
      const res = await fetch(`${API_BASE_URL}/disputes/${orderId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.disputeOpened"));
      loadDisputes();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.disputeOpenError"));
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await authFetch("/admin/companies");
      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setAdminCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.companiesLoadError"));
    }
  };

  const approveCompany = async (companyId: string) => {
    try {
      const res = await authFetch(`/admin/companies/${companyId}/approve`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.companyApproved"));
      loadCompanies();
      loadAdminMetricsOverview();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.companyApproveError"));
    }
  };

  const blockCompany = async (companyId: string) => {
    try {
      const res = await authFetch(`/admin/companies/${companyId}/block`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.companyBlocked"));
      loadCompanies();
      loadAdminMetricsOverview();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.companyBlockError"));
    }
  };

  const loadAdminMetricsOverview = async () => {
    try {
      const res = await authFetch("/admin/metrics/overview");
      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setAdminMetrics(data);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.metricsOverviewError"));
    }
  };

  const loadAdminMetricsTimeseries = async () => {
    try {
      const res = await authFetch("/admin/metrics/timeseries");
      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setAdminTimeseries(data);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.metricsTimeseriesError"));
    }
  };

  const loadAdminLedger = async () => {
    try {
      const res = await authFetch("/admin/ledger");
      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setAdminLedger(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.ledgerLoadError"));
    }
  };

  const loadPendingProducts = async () => {
    try {
      const res = await authFetch("/admin/products/pending");
      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setAdminPendingProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.pendingProductsError"));
    }
  };

  const approveProduct = async (productId: string) => {
    try {
      const res = await authFetch(`/admin/products/${productId}/approve`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      alert(t("panelPage.errors.productApproved"));
      loadPendingProducts();
      loadAdminMetricsOverview();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert(t("panelPage.errors.productApproveError"));
    }
  };

  useEffect(() => {
    if (!token) return;

    loadOrders();
    loadQuotes();
    loadMyRFQs();
    loadDisputes();

    if (role === "SELLER") {
      loadOpenRFQs();
    }

    if (role === "ADMIN") {
      loadCompanies();
      loadAdminMetricsOverview();
      loadAdminMetricsTimeseries();
      loadAdminLedger();
      loadPendingProducts();
    }
  }, [token, role]);

  const totalSales = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + (Number(order.totalAmount) || 0),
      0
    );
  }, [orders]);

  const activeOrders = useMemo(() => {
    return orders.filter(
      (order) => !["COMPLETED", "CANCELLED"].includes(order.status)
    ).length;
  }, [orders]);

  const completedOrders = useMemo(() => {
    return orders.filter((order) => order.status === "COMPLETED").length;
  }, [orders]);

  const paidOrders = useMemo(() => {
    return orders.filter((order) =>
      ["PAID", "PREPARING", "SHIPPED", "COMPLETED"].includes(order.status)
    ).length;
  }, [orders]);

  const buyerOpenRfqs = useMemo(() => {
    return rfqs.filter((rfq) => rfq.status === "OPEN").length;
  }, [rfqs]);

  const buyerClosedRfqs = useMemo(() => {
    return rfqs.filter((rfq) => rfq.status === "CLOSED").length;
  }, [rfqs]);

  const buyerQuoteCount = useMemo(() => {
    return quotes.length;
  }, [quotes]);

  const buyerOpenDisputes = useMemo(() => {
    return disputes.filter((d) => d.status !== "RESOLVED").length;
  }, [disputes]);

  const selectedProductImage =
    selectedProduct?.images && selectedProduct.images.length > 0
      ? resolveAssetUrl(selectedProduct.images[0].url)
      : resolveAssetUrl(selectedProduct?.imageUrl);

  const adminOverviewCards = useMemo(() => {
    if (!adminMetrics) return [];

    return [
      { title: t("panelPage.admin.totalCompanies"), value: adminMetrics?.companies?.total ?? 0 },
      { title: t("panelPage.admin.approvedCompanies"), value: adminMetrics?.companies?.approved ?? 0 },
      { title: t("panelPage.admin.totalUsers"), value: adminMetrics?.users?.total ?? 0 },
      {
        title: t("panelPage.admin.totalProducts"),
        value: adminMetrics?.marketplace?.productsTotal ?? 0,
      },
      { title: t("panelPage.admin.totalRfqs"), value: adminMetrics?.marketplace?.rfqsTotal ?? 0 },
      {
        title: t("panelPage.admin.totalQuotes"),
        value: adminMetrics?.marketplace?.quotesTotal ?? 0,
      },
      { title: t("panelPage.admin.totalOrders"), value: adminMetrics?.orders?.total ?? 0 },
      {
        title: t("panelPage.admin.completedOrders"),
        value: adminMetrics?.orders?.completed ?? 0,
      },
    ];
  }, [adminMetrics, t]);

  const timeseriesChartData = useMemo(() => {
    if (!adminTimeseries) return null;

    return {
      labels: adminTimeseries.labels,
      datasets: [
        {
          label: t("panelPage.admin.orders"),
          data: adminTimeseries.series.ordersCreated,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.25)",
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
        },
        {
          label: t("panelPage.admin.disputes"),
          data: adminTimeseries.series.disputesCreated,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239,68,68,0.20)",
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
        },
      ],
    };
  }, [adminTimeseries, t]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 2,
        ticks: {
          color: "#fff",
          stepSize: 1,
        },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div style={pageStyle}>
      {role === "ADMIN" && (
        <div style={{ ...sectionCardStyle, marginTop: 24 }}>
          <h2 style={{ marginBottom: 20 }}>{t("panelPage.admin.dashboard")}</h2>

          {adminOverviewCards.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {adminOverviewCards.map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: "#0f172a",
                    color: "#fff",
                    borderRadius: 14,
                    padding: 18,
                    border: "1px solid #1e293b",
                  }}
                >
                  <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 8 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {timeseriesChartData && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>{t("panelPage.admin.chartTitle")}</h3>
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <Line data={timeseriesChartData} options={chartOptions} />
              </div>
            </div>
          )}

          {adminPendingProducts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>{t("panelPage.admin.pendingProducts")}</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {adminPendingProducts.map((product: any) => {
                  const imageUrl = product?.imageUrl
                    ? resolveAssetUrl(product.imageUrl)
                    : product?.images?.[0]?.url
                    ? resolveAssetUrl(product.images[0].url)
                    : "https://placehold.co/600x400?text=No+Image";

                  return (
                    <div
                      key={product.id}
                      style={{
                        background: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    >
                      <img
                        src={imageUrl}
                        alt={product.title}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          background: "#f3f4f6",
                        }}
                      />

                      <div style={{ padding: 16 }}>
                        <div
                          style={{
                            background: "#facc15",
                            color: "#111827",
                            padding: "4px 10px",
                            borderRadius: 8,
                            display: "inline-block",
                            fontSize: 12,
                            fontWeight: 700,
                            marginBottom: 10,
                          }}
                        >
                          {t("panelPage.admin.pending")}
                        </div>

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            marginBottom: 8,
                            color: "#111827",
                          }}
                        >
                          {product.title}
                        </div>

                        <div
                          style={{
                            fontSize: 14,
                            color: "#6b7280",
                            marginBottom: 8,
                          }}
                        >
                          {product.description || t("panelPage.admin.noDescription")}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gap: 6,
                            marginBottom: 14,
                          }}
                        >
                          <div>
                            <strong>{t("panelPage.admin.category")}</strong> {product.category?.name || "-"}
                          </div>
                          <div>
                            <strong>{t("panelPage.admin.seller")}</strong> {product.seller?.name || "-"}
                          </div>
                          <div>
                            <strong>{t("panelPage.admin.price")}</strong> {product.basePrice} ₺
                          </div>
                          <div>
                            <strong>{t("panelPage.admin.moq")}</strong> {product.moq}
                          </div>
                          <div>
                            <strong>{t("panelPage.admin.unit")}</strong> {product.unitType}
                          </div>
                        </div>

                        <button
                          onClick={() => approveProduct(product.id)}
                          style={{
                            width: "100%",
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "12px 14px",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          {t("panelPage.admin.approveProduct")}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {adminCompanies.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>{t("panelPage.admin.companies")}</h3>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                      <th style={tableHeadStyle}>{t("panelPage.admin.name")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.email")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.role")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.status")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.verified")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminCompanies.map((company: any) => (
                      <tr
                        key={company.id}
                        style={{ borderTop: "1px solid #e5e7eb" }}
                      >
                        <td style={tableCellStyle}>{company.name}</td>
                        <td style={tableCellStyle}>{company.email || "-"}</td>
                        <td style={tableCellStyle}>{company.role || "-"}</td>
                        <td style={tableCellStyle}>{company.status || "-"}</td>
                        <td style={tableCellStyle}>
                          {company.verified ? t("panelPage.admin.yes") : t("panelPage.admin.no")}
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button
                              onClick={() => approveCompany(company.id)}
                              style={{
                                background: "#16a34a",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 10px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              {t("panelPage.admin.approve")}
                            </button>

                            <button
                              onClick={() => blockCompany(company.id)}
                              style={{
                                background: "#dc2626",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                padding: "8px 10px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              {t("panelPage.admin.block")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {adminLedger.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 12 }}>{t("panelPage.admin.ledgerRecords")}</h3>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    background: "#fff",
                    borderRadius: 12,
                    overflow: "hidden",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f3f4f6", textAlign: "left" }}>
                      <th style={tableHeadStyle}>{t("panelPage.admin.type")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.orderId")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.amount")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.currency")}</th>
                      <th style={tableHeadStyle}>{t("panelPage.admin.note")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminLedger.map((item: any) => (
                      <tr
                        key={item.id}
                        style={{ borderTop: "1px solid #e5e7eb" }}
                      >
                        <td style={tableCellStyle}>{item.type}</td>
                        <td style={tableCellStyle}>{item.orderId || "-"}</td>
                        <td style={tableCellStyle}>{item.amount}</td>
                        <td style={tableCellStyle}>{item.currency}</td>
                        <td style={tableCellStyle}>{item.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div
        style={{
          background: "#0b1120",
          color: "#fff",
          borderRadius: 24,
          padding: 32,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0, color: "#2563eb", fontSize: 38 }}>
            {APP_TITLE}
          </h2>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {!token ? (
              <>
                <Link
  to="/register"
  style={{
    background: "#22c55e",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    textDecoration: "none",
  }}
>
  {t("panelPage.hero.register")}
</Link>

<Link
  to="/login"
  style={{
    background: "#1d4ed8",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    textDecoration: "none",
  }}
>
  {t("panelPage.hero.login")}
</Link>
              </>
            ) : (
              <button
                onClick={logout}
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "12px 18px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                {t("panelPage.hero.logout")}
              </button>
            )}
          </div>
        </div>

        {!token && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("panelPage.hero.email")}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "14px 16px",
                outline: "none",
                fontSize: 15,
              }}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("panelPage.hero.password")}
              style={{
                border: "none",
                borderRadius: 12,
                padding: "14px 16px",
                outline: "none",
                fontSize: 15,
              }}
            />
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: 24,
          }}
        >
          <div
            style={{
              borderRadius: 28,
              padding: 36,
              background: "linear-gradient(135deg,#1d4ed8,#22d3ee)",
            }}
          >
            <div style={{ letterSpacing: 2, opacity: 0.9, marginBottom: 16 }}>
              {t("panelPage.hero.eyebrow")}
            </div>

            <h1
              style={{
                fontSize: 56,
                lineHeight: 1.05,
                margin: "0 0 18px 0",
                fontWeight: 800,
              }}
            >
              {t("panelPage.hero.title1")}
              <br />
              {t("panelPage.hero.title2")}
            </h1>

            <p
              style={{
                fontSize: 22,
                lineHeight: 1.5,
                opacity: 0.95,
                maxWidth: 780,
                marginBottom: 20,
              }}
            >
              {t("panelPage.hero.description")}
            </p>

            <div style={{ opacity: 0.9, marginBottom: 22 }}>
              {t("panelPage.hero.stats")}
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 18,
                flexWrap: "wrap",
              }}
            >
              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t("panelPage.hero.searchPlaceholder")}
                style={{
                  flex: 1,
                  minWidth: 260,
                  border: "none",
                  borderRadius: 14,
                  padding: "16px 18px",
                  outline: "none",
                  fontSize: 16,
                }}
              />

              <button
                onClick={searchProducts}
                style={{
                  background: "#1d4ed8",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "16px 24px",
                  cursor: "pointer",
                  fontWeight: 700,
                  minWidth: 90,
                }}
              >
                {t("panelPage.hero.search")}
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
              <Link
  to="/register"
  style={{
    background: "#84cc16",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    textDecoration: "none",
  }}
>
  {t("panelPage.hero.register")}
</Link>

<Link
  to="/login"
  style={{
    background: "#fff",
    color: "#111827",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    textDecoration: "none",
  }}
>
  {t("panelPage.hero.login")}
</Link>
              

              <button
                style={{
                  background: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.5)",
                  borderRadius: 12,
                  padding: "12px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("panelPage.hero.becomeSeller")}
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                t("panelPage.hero.verifiedCompanies"),
                t("panelPage.hero.rfqSupported"),
                t("panelPage.hero.region"),
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    padding: "10px 14px",
                    borderRadius: 999,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              color: "#111827",
              borderRadius: 28,
              padding: 28,
            }}
          >
            <div
              style={{
                color: "#4f46e5",
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              {t("panelPage.hero.advantages")}
            </div>

            <h3 style={{ marginTop: 0, fontSize: 24, marginBottom: 20 }}>
              {t("panelPage.hero.advantagesTitle")}
            </h3>

            <div style={{ display: "grid", gap: 14 }}>
              {[
                [
                  t("panelPage.hero.advantage1Title"),
                  t("panelPage.hero.advantage1Desc"),
                ],
                [
                  t("panelPage.hero.advantage2Title"),
                  t("panelPage.hero.advantage2Desc"),
                ],
                [
                  t("panelPage.hero.advantage3Title"),
                  t("panelPage.hero.advantage3Desc"),
                ],
                [
                  t("panelPage.hero.advantage4Title"),
                  t("panelPage.hero.advantage4Desc"),
                ],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
                  <div style={{ color: "#6b7280", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: 20 }}>{t("panelPage.marketplace.popularCategories")}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,180px)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {categories.slice(0, 8).map((cat) => (
          <div
            key={cat.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={() => loadProducts(cat.id)}
          >
            {cat.name}
          </div>
        ))}
      </div>

      <DashboardStats
        role={role}
        totalSales={totalSales}
        activeOrders={activeOrders}
        completedOrders={completedOrders}
        paidOrders={paidOrders}
        openRfqsCount={openRfqs.length}
        totalOrders={orders.length}
        buyerOpenRfqs={buyerOpenRfqs}
        buyerClosedRfqs={buyerClosedRfqs}
        buyerQuoteCount={buyerQuoteCount}
        buyerOpenDisputes={buyerOpenDisputes}
        buyerCompletedOrders={
          orders.filter((o) => o.status === "COMPLETED").length
        }
        buyerPendingPayments={
          orders.filter((o) => o.status === "PENDING_PAYMENT").length
        }
      />

      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          loadProducts={loadProducts}
          sidebarStyle={sidebarStyle}
        />

        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  searchProducts();
                }
              }}
              placeholder={t("panelPage.marketplace.searchPlaceholder")}
              style={{ ...inputStyle, marginRight: 8 }}
            />
            <button onClick={searchProducts} style={primaryButtonStyle}>
              {t("panelPage.marketplace.search")}
            </button>
          </div>

          {role === "SELLER" && (
            <ProductCreateForm
              categories={categories}
              onCreated={() => {
                loadProducts();
              }}
            />
          )}

          <h2 style={{ marginBottom: 20 }}>{t("panelPage.marketplace.products")}</h2>

          <ProductGrid
            products={products}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onOpenRfq={(product) => setRfqProduct(product)}
          />

          <RFQList
            role={role}
            rfqs={rfqs}
            openRfqs={openRfqs}
            openQuoteModal={(rfq) => setSelectedQuoteRfq(rfq)}
            panelCardStyle={panelCardStyle}
          />

          <QuoteList
            quotes={quotes}
            role={role}
            acceptQuote={acceptQuote}
            panelCardStyle={panelCardStyle}
          />

          <OrderList
            orders={orders}
            role={role}
            payOrder={payOrder}
            prepareOrder={prepareOrder}
            shipOrder={shipOrder}
            completeOrder={completeOrder}
            openDispute={openDispute}
            panelCardStyle={panelCardStyle}
            statusBadgeStyle={statusBadgeStyle}
          />

          <DisputeList disputes={disputes} panelCardStyle={panelCardStyle} />

          {role === "SELLER" && (
            <RFQMarketplace
              rfqs={openRfqs}
              openQuoteModal={(rfq) => setSelectedQuoteRfq(rfq)}
            />
          )}
        </div>
      </div>

      <div
        style={{
          marginTop: 40,
          padding: 30,
          borderRadius: 16,
          background: "#0f172a",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2>{t("panelPage.marketplace.bulkTitle")}</h2>

        <p style={{ opacity: 0.8 }}>
          {t("panelPage.marketplace.bulkText")}
        </p>

        <button
          style={{
            marginTop: 16,
            ...primaryButtonStyle,
          }}
          onClick={() => window.scrollTo({ top: 1200, behavior: "smooth" })}
        >
          {t("panelPage.marketplace.createRfq")}
        </button>
      </div>

      {selectedProduct && (
        <div style={modalOverlayStyle} onClick={() => setSelectedProduct(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              ...modalContentStyle,
              maxWidth: 900,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            <div>
              <img
                src={selectedProductImage}
                alt={selectedProduct.title}
                style={{
                  width: "100%",
                  height: 360,
                  objectFit: "cover",
                  borderRadius: 12,
                  background: "#f3f4f6",
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <h2 style={{ margin: 0 }}>{selectedProduct.title}</h2>

              <div style={{ color: "#6b7280", lineHeight: 1.6 }}>
                {selectedProduct.description || t("panelPage.productModal.noDescription")}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 10,
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div>
                  <strong>{t("panelPage.admin.price")}</strong> {selectedProduct.basePrice} ₺
                </div>

                <div>
                  <strong>{t("panelPage.admin.moq")}</strong> {selectedProduct.moq}{" "}
                  {selectedProduct.unitType}
                </div>

                <div>
                  <strong>{t("panelPage.productModal.deliveryTime")}</strong>{" "}
                  {selectedProduct.leadTimeDays || "-"} {t("panelPage.productModal.days")}
                </div>

                <div>
                  <strong>{t("panelPage.admin.category")}</strong>{" "}
                  {selectedProduct.category?.name || "-"}
                </div>

                <div>
                  <strong>{t("panelPage.admin.seller")}</strong> {selectedProduct.seller?.name || t("panelPage.productModal.verifiedCompany")}
                </div>

                {selectedProduct.seller?.verified && (
                  <div
                    style={{
                      color: "#16a34a",
                      fontWeight: 700,
                      marginTop: 4,
                    }}
                  >
                    ✔ {t("panelPage.productModal.verifiedCompany")}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setRfqProduct(selectedProduct);
                  }}
                  style={primaryButtonStyle}
                >
                  {t("panelPage.productModal.sendRfq")}
                </button>

                <button
                  onClick={() => setSelectedProduct(null)}
                  style={secondaryButtonStyle}
                >
                  {t("panelPage.productModal.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedQuoteRfq && (
        <div
          style={modalOverlayStyle}
          onClick={() => setSelectedQuoteRfq(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ ...modalContentStyle, width: 400 }}
          >
            <h2>{t("panelPage.quoteModal.title")}</h2>

            <p>
              <b>{selectedQuoteRfq.product?.title || "RFQ"}</b>
            </p>

            <input
              placeholder={t("panelPage.quoteModal.unitPrice")}
              value={quotePrice}
              onChange={(e) => setQuotePrice(e.target.value)}
              style={{ ...inputStyle, width: "100%", marginTop: 8 }}
            />

            <input
              placeholder={t("panelPage.quoteModal.deliveryDays")}
              value={quoteDays}
              onChange={(e) => setQuoteDays(e.target.value)}
              style={{ ...inputStyle, width: "100%", marginTop: 8 }}
            />

            <textarea
              placeholder={t("panelPage.quoteModal.sellerNote")}
              value={quoteNote}
              onChange={(e) => setQuoteNote(e.target.value)}
              style={{
                ...inputStyle,
                width: "100%",
                marginTop: 8,
                minHeight: 100,
              }}
            />

            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setSelectedQuoteRfq(null);
                  setQuotePrice("");
                  setQuoteDays("");
                  setQuoteNote("");
                }}
                style={secondaryButtonStyle}
              >
                {t("panelPage.quoteModal.cancel")}
              </button>

              <button
                onClick={async () => {
                  if (!selectedQuoteRfq) return;

                  await sendQuote(
                    selectedQuoteRfq.id,
                    Number(quotePrice),
                    Number(quoteDays),
                    quoteNote
                  );

                  setSelectedQuoteRfq(null);
                  setQuotePrice("");
                  setQuoteDays("");
                  setQuoteNote("");
                }}
                style={primaryButtonStyle}
              >
                {t("panelPage.quoteModal.send")}
              </button>
            </div>
          </div>
        </div>
      )}

      {rfqProduct && (
        <div style={modalOverlayStyle} onClick={() => setRfqProduct(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ ...modalContentStyle, width: 400 }}
          >
            <h2>{t("panelPage.rfqModal.title")}</h2>

            <p>
              <b>{rfqProduct.title}</b>
            </p>

            <div style={{ marginTop: 12 }}>
              {t("panelPage.rfqModal.quantity")}
              <input
                type="number"
                value={rfqQuantity}
                onChange={(e) => setRfqQuantity(Number(e.target.value))}
                style={{ ...inputStyle, width: "100%", marginTop: 4 }}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              {t("panelPage.rfqModal.note")}
              <textarea
                value={rfqNote}
                onChange={(e) => setRfqNote(e.target.value)}
                style={{
                  ...inputStyle,
                  width: "100%",
                  marginTop: 4,
                  minHeight: 100,
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button
                onClick={() => setRfqProduct(null)}
                style={secondaryButtonStyle}
              >
                {t("panelPage.quoteModal.cancel")}
              </button>
              <button onClick={submitRFQ} style={primaryButtonStyle}>
                {t("panelPage.quoteModal.send")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  padding: 40,
  background: "#f8fafc",
  minHeight: "100vh",
  color: "#111827",
};

const sectionCardStyle: React.CSSProperties = {
  background: "#fff",
  padding: 20,
  borderRadius: 12,
  marginBottom: 24,
  border: "1px solid #e5e7eb",
};

const panelCardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  background: "#fff",
};

const sidebarStyle: React.CSSProperties = {
  width: 280,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#1f2937",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#fff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  borderRadius: 8,
  padding: "10px 12px",
  outline: "none",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalContentStyle: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  borderRadius: 12,
  width: "100%",
  maxWidth: 500,
};

const tableHeadStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
};

const tableCellStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontSize: 14,
  color: "#374151",
};

const statusBadgeStyle = (status: string): React.CSSProperties => ({
  padding: "4px 8px",
  borderRadius: 8,
  background:
    status === "PENDING_PAYMENT"
      ? "#fef3c7"
      : status === "PAID"
      ? "#dbeafe"
      : status === "PREPARING"
      ? "#ede9fe"
      : status === "SHIPPED"
      ? "#cffafe"
      : status === "COMPLETED"
      ? "#dcfce7"
      : status === "ACCEPTED"
      ? "#dcfce7"
      : status === "SENT"
      ? "#dbeafe"
      : "#e5e7eb",
  color: "#111827",
  fontWeight: 600,
});