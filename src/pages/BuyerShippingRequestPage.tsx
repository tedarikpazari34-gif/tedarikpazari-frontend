import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { TURKEY_CITIES } from "../constants/turkeyCities";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

const VEHICLE_TYPES = [
  "Kamyonet",
  "Kamyon",
  "Tır",
  "Tenteli Tır",
  "Frigorifik Araç",
  "Konteyner Taşıma",
  "Parsiyel Taşıma",
  "Panelvan",
  "Açık Kasa",
  "Kapalı Kasa",
  "Diğer",
];

type Order = {
  id: string;
  status: string;
  rfq?: {
    quantity?: number;
    product?: {
      title?: string;
      unitType?: string;
    };
  };
};

export default function BuyerShippingRequestPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedOrderId = params.get("orderId") || "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [orderId, setOrderId] = useState(requestedOrderId);

  const [fromCity, setFromCity] = useState("");
  const [fromDistrict, setFromDistrict] = useState("");
  const [fromOpenAddress, setFromOpenAddress] = useState("");

  const [toCity, setToCity] = useState("");
  const [toDistrict, setToDistrict] = useState("");
  const [toOpenAddress, setToOpenAddress] = useState("");

  const [palletCount, setPalletCount] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");

  const [vehicleType, setVehicleType] = useState("");
  const [loadingDate, setLoadingDate] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] =
    useState("");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === orderId),
    [orders, orderId]
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Nakliye talebi oluşturmak için giriş yapmalısınız.");
          return;
        }

        const res = await fetch(`${API}/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setError(data?.message || "Siparişler alınamadı.");
          setOrders([]);
          return;
        }

        const loadedOrders = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setOrders(loadedOrders);

        if (
          requestedOrderId &&
          loadedOrders.some(
            (order: Order) => order.id === requestedOrderId
          )
        ) {
          setOrderId(requestedOrderId);
        }
      } catch (err) {
        console.error("SHIPPING ORDER LOAD ERROR:", err);
        setError("Siparişler alınırken hata oluştu.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [requestedOrderId]);

  const validate = () => {
    if (!orderId) return "Sipariş seçmelisiniz.";

    if (!fromCity || !fromDistrict.trim()) {
      return "Çıkış ili ve ilçesi zorunludur.";
    }

    if (!fromOpenAddress.trim()) {
      return "Yükleme açık adresini yazmalısınız.";
    }

    if (!toCity || !toDistrict.trim()) {
      return "Varış ili ve ilçesi zorunludur.";
    }

    if (!toOpenAddress.trim()) {
      return "Teslimat açık adresini yazmalısınız.";
    }

    if (
      fromCity === toCity &&
      fromDistrict.trim().toLocaleLowerCase("tr-TR") ===
        toDistrict.trim().toLocaleLowerCase("tr-TR") &&
      fromOpenAddress.trim().toLocaleLowerCase("tr-TR") ===
        toOpenAddress.trim().toLocaleLowerCase("tr-TR")
    ) {
      return "Çıkış ve varış adresleri aynı olamaz.";
    }

    if (palletCount && Number(palletCount) < 0) {
      return "Palet sayısı geçersiz.";
    }

    if (packageCount && Number(packageCount) < 0) {
      return "Koli sayısı geçersiz.";
    }

    if (weight && Number(weight) <= 0) {
      return "Ağırlık sıfırdan büyük olmalıdır.";
    }

    if (volume && Number(volume) <= 0) {
      return "Hacim sıfırdan büyük olmalıdır.";
    }

    if (!vehicleType) {
      return "Araç veya taşıma tipini seçmelisiniz.";
    }

    if (!loadingDate) {
      return "Yükleme tarihini seçmelisiniz.";
    }

    if (
      requestedDeliveryDate &&
      requestedDeliveryDate < loadingDate
    ) {
      return "Teslim tarihi yükleme tarihinden önce olamaz.";
    }

    return "";
  };

  const submit = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/shipping/rfq`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,

          fromCity,
          fromDistrict: fromDistrict.trim(),
          fromOpenAddress: fromOpenAddress.trim(),

          toCity,
          toDistrict: toDistrict.trim(),
          toOpenAddress: toOpenAddress.trim(),

          palletCount: palletCount
            ? Number(palletCount)
            : null,
          packageCount: packageCount
            ? Number(packageCount)
            : null,

          weight: weight ? Number(weight) : null,
          volume: volume ? Number(volume) : null,

          vehicleType,
          loadingDate,
          requestedDeliveryDate:
            requestedDeliveryDate || null,

          note: note.trim() || null,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.message || "Nakliye talebi oluşturulamadı."
        );
        return;
      }

      alert("Nakliye talebi başarıyla oluşturuldu ✅");
      navigate("/buyer/shipping-quotes");
    } catch (err) {
      console.error("SHIPPING RFQ CREATE ERROR:", err);
      setError("Nakliye talebi oluşturulurken hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={emptyCardStyle}>
          Nakliye formu yükleniyor...
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <div>
          <div style={eyebrowStyle}>
            ALICI LOJİSTİK PANELİ
          </div>

          <h1 style={heroTitleStyle}>
            Nakliye Teklifi İste
          </h1>

          <p style={heroTextStyle}>
            Yük, rota ve teslimat bilgilerini eksiksiz
            doldurun; lojistik firmalarından karşılaştırılabilir
            teklifler alın.
          </p>
        </div>

        <Link to="/buyer/orders" style={backLinkStyle}>
          ← Siparişlerime Dön
        </Link>
      </section>

      <section style={formCardStyle}>
        {error && <div style={errorStyle}>{error}</div>}

        <FormSection
          number="1"
          title="Sipariş ve yük bilgileri"
          description="Nakliyesi yapılacak siparişi ve yük özelliklerini belirtin."
        >
          <label style={fieldStyle}>
            <span style={labelStyle}>Sipariş *</span>

            <select
              value={orderId}
              onChange={(event) =>
                setOrderId(event.target.value)
              }
              style={inputStyle}
            >
              <option value="">Sipariş seçin</option>

              {orders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.id.slice(0, 8)} —{" "}
                  {order.rfq?.product?.title || "Ürün"} —{" "}
                  {order.status}
                </option>
              ))}
            </select>
          </label>

          {selectedOrder && (
            <div style={selectedOrderStyle}>
              <div>
                <span>Seçilen ürün</span>
                <strong>
                  {selectedOrder.rfq?.product?.title || "Ürün"}
                </strong>
              </div>

              <div>
                <span>Sipariş miktarı</span>
                <strong>
                  {selectedOrder.rfq?.quantity || "-"}{" "}
                  {selectedOrder.rfq?.product?.unitType || ""}
                </strong>
              </div>
            </div>
          )}

          <div style={twoColumnStyle}>
            <NumberField
              label="Palet Sayısı"
              value={palletCount}
              onChange={setPalletCount}
              placeholder="Örn: 10"
            />

            <NumberField
              label="Koli Sayısı"
              value={packageCount}
              onChange={setPackageCount}
              placeholder="Örn: 240"
            />

            <NumberField
              label="Toplam Ağırlık (kg)"
              value={weight}
              onChange={setWeight}
              placeholder="Örn: 7500"
              step="0.01"
            />

            <NumberField
              label="Toplam Hacim (m³)"
              value={volume}
              onChange={setVolume}
              placeholder="Örn: 18.5"
              step="0.01"
            />
          </div>

          <label style={fieldStyle}>
            <span style={labelStyle}>
              Araç / Taşıma Tipi *
            </span>

            <select
              value={vehicleType}
              onChange={(event) =>
                setVehicleType(event.target.value)
              }
              style={inputStyle}
            >
              <option value="">Araç tipi seçin</option>

              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </FormSection>

        <FormSection
          number="2"
          title="Yükleme noktası"
          description="Nakliyecinin yükü teslim alacağı adresi belirtin."
        >
          <div style={twoColumnStyle}>
            <CityField
              label="Çıkış İli *"
              value={fromCity}
              onChange={setFromCity}
            />

            <TextField
              label="Çıkış İlçesi *"
              value={fromDistrict}
              onChange={setFromDistrict}
              placeholder="Örn: Başakşehir"
            />
          </div>

          <label style={fieldStyle}>
            <span style={labelStyle}>
              Yükleme Açık Adresi *
            </span>

            <textarea
              value={fromOpenAddress}
              onChange={(event) =>
                setFromOpenAddress(event.target.value)
              }
              style={textareaStyle}
              placeholder="Mahalle, cadde, sokak, bina/depo numarası ve yükleme noktası bilgileri..."
            />
          </label>
        </FormSection>

        <FormSection
          number="3"
          title="Teslimat noktası"
          description="Yükün teslim edileceği adresi belirtin."
        >
          <div style={twoColumnStyle}>
            <CityField
              label="Varış İli *"
              value={toCity}
              onChange={setToCity}
            />

            <TextField
              label="Varış İlçesi *"
              value={toDistrict}
              onChange={setToDistrict}
              placeholder="Örn: Yenimahalle"
            />
          </div>

          <label style={fieldStyle}>
            <span style={labelStyle}>
              Teslimat Açık Adresi *
            </span>

            <textarea
              value={toOpenAddress}
              onChange={(event) =>
                setToOpenAddress(event.target.value)
              }
              style={textareaStyle}
              placeholder="Mahalle, cadde, sokak, bina/depo numarası ve teslim noktası bilgileri..."
            />
          </label>
        </FormSection>

        <FormSection
          number="4"
          title="Tarih ve özel talepler"
          description="Yükleme zamanı ile varsa teslimat beklentinizi paylaşın."
        >
          <div style={twoColumnStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>
                Yükleme Tarihi *
              </span>

              <input
                type="date"
                value={loadingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(event) =>
                  setLoadingDate(event.target.value)
                }
                style={inputStyle}
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>
                İstenen Teslim Tarihi
              </span>

              <input
                type="date"
                value={requestedDeliveryDate}
                min={
                  loadingDate ||
                  new Date().toISOString().split("T")[0]
                }
                onChange={(event) =>
                  setRequestedDeliveryDate(
                    event.target.value
                  )
                }
                style={inputStyle}
              />
            </label>
          </div>

          <label style={fieldStyle}>
            <span style={labelStyle}>Ek Not</span>

            <textarea
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              style={{
                ...textareaStyle,
                minHeight: 140,
              }}
              placeholder="Yükleme saati, forklift ihtiyacı, hassas ürün, soğuk zincir, kat bilgisi veya diğer özel talepler..."
            />
          </label>
        </FormSection>

        <div style={summaryStyle}>
          <div>
            <strong>Talep gönderilmeden önce</strong>
            <span>
              Nakliye firmaları verdiğiniz rota ve yük
              bilgilerine göre teklif oluşturacaktır.
            </span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            style={{
              ...submitButtonStyle,
              opacity: submitting ? 0.65 : 1,
              cursor: submitting
                ? "not-allowed"
                : "pointer",
            }}
          >
            {submitting
              ? "Nakliye talebi oluşturuluyor..."
              : "🚚 Nakliye Talebini Yayınla"}
          </button>
        </div>
      </section>
    </main>
  );
}

function FormSection({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <span style={sectionNumberStyle}>{number}</span>

        <div>
          <h2 style={sectionTitleStyle}>{title}</h2>
          <p style={sectionDescriptionStyle}>
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function CityField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle}
      >
        <option value="">Şehir seçin</option>

        {TURKEY_CITIES.map((cityName) => (
          <option key={cityName} value={cityName}>
            {cityName}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  step = "1",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  step?: string;
}) {
  return (
    <label style={fieldStyle}>
      <span style={labelStyle}>{label}</span>

      <input
        type="number"
        min="0"
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "40px 20px",
  background: "#f8fafc",
};

const heroStyle: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto 22px",
  padding: 30,
  borderRadius: 26,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 20,
  flexWrap: "wrap",
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f172a, #0f766e)",
  boxShadow: "0 22px 46px rgba(15,23,42,0.18)",
};

const eyebrowStyle: CSSProperties = {
  marginBottom: 8,
  color: "#99f6e4",
  fontSize: 12,
  fontWeight: 900,
};

const heroTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 36,
  fontWeight: 900,
};

const heroTextStyle: CSSProperties = {
  maxWidth: 680,
  margin: 0,
  color: "#ccfbf1",
  lineHeight: 1.65,
};

const backLinkStyle: CSSProperties = {
  padding: "11px 14px",
  borderRadius: 12,
  color: "#ffffff",
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
  textDecoration: "none",
  fontWeight: 800,
};

const formCardStyle: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  padding: 26,
  borderRadius: 26,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 18px 42px rgba(15,23,42,0.09)",
};

const sectionStyle: CSSProperties = {
  marginBottom: 22,
  padding: 20,
  borderRadius: 20,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const sectionHeaderStyle: CSSProperties = {
  marginBottom: 18,
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
};

const sectionNumberStyle: CSSProperties = {
  width: 34,
  height: 34,
  flex: "0 0 34px",
  display: "grid",
  placeItems: "center",
  borderRadius: 999,
  color: "#ffffff",
  background: "#0f766e",
  fontWeight: 900,
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 4px",
  color: "#0f172a",
  fontSize: 21,
  fontWeight: 900,
};

const sectionDescriptionStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.5,
  fontSize: 14,
};

const twoColumnStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
};

const fieldStyle: CSSProperties = {
  marginBottom: 14,
  display: "grid",
  gap: 7,
};

const labelStyle: CSSProperties = {
  color: "#334155",
  fontSize: 13,
  fontWeight: 900,
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  padding: "0 13px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 100,
  padding: 13,
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  fontFamily: "inherit",
  lineHeight: 1.5,
  resize: "vertical",
  outline: "none",
};

const selectedOrderStyle: CSSProperties = {
  marginBottom: 16,
  padding: 14,
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 12,
  borderRadius: 14,
  color: "#134e4a",
  background: "#f0fdfa",
  border: "1px solid #99f6e4",
};

const summaryStyle: CSSProperties = {
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  flexWrap: "wrap",
  borderRadius: 18,
  color: "#166534",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
};

const submitButtonStyle: CSSProperties = {
  minHeight: 50,
  padding: "0 20px",
  border: "none",
  borderRadius: 13,
  color: "#ffffff",
  background: "linear-gradient(135deg, #0f766e, #047857)",
  fontWeight: 900,
  fontSize: 15,
  boxShadow: "0 10px 22px rgba(15,118,110,0.22)",
};

const errorStyle: CSSProperties = {
  marginBottom: 18,
  padding: 14,
  borderRadius: 13,
  color: "#991b1b",
  background: "#fee2e2",
  border: "1px solid #fecaca",
  fontWeight: 700,
};

const emptyCardStyle: CSSProperties = {
  maxWidth: 700,
  margin: "30px auto",
  padding: 30,
  borderRadius: 22,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
};
