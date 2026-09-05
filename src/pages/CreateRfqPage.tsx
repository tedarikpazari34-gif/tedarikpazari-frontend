import { useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { TURKEY_CITIES } from "../constants/turkeyCities";
import { useTranslation } from "react-i18next";

const BASE_URL = "https://tedarik-backend.onrender.com";


type Product = {
  id: string;
  title: string;
  imageUrl?: string;
  basePrice?: string;
};

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
};

export default function CreateRfqPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";
  const [params] = useSearchParams();

  const productId = params.get("productId");
  const initialCategory = params.get("category");
  const productName = params.get("product");
  const copiedQuantity = params.get("quantity");
  const copiedNote = params.get("note");

  const draftKey = `rfq-draft:${productId || initialCategory || productName || "general"}`;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedRootId, setSelectedRootId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [requestTitle, setRequestTitle] = useState(productName || "");

  const [quantity, setQuantity] = useState(copiedQuantity || "100");
  const [unitType, setUnitType] = useState("Adet");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [note, setNote] = useState(copiedNote || "");

  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [createdRfqId, setCreatedRfqId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);

      if (!raw) return;

      const draft = JSON.parse(raw);

      if (draft.quantity !== undefined) {
        setQuantity(String(draft.quantity));
      }

      if (draft.unitType !== undefined) {
        setUnitType(String(draft.unitType));
      }

      if (draft.deliveryCity !== undefined) {
        setDeliveryCity(String(draft.deliveryCity));
      }

      if (draft.targetPrice !== undefined) {
        setTargetPrice(String(draft.targetPrice));
      }

      if (draft.note !== undefined) {
        setNote(String(draft.note));
      }

      if (draft.requestTitle !== undefined) {
        setRequestTitle(String(draft.requestTitle));
      }

      if (draft.selectedRootId !== undefined) {
        setSelectedRootId(String(draft.selectedRootId));
      }

      if (draft.selectedCategoryId !== undefined) {
        setSelectedCategoryId(String(draft.selectedCategoryId));
      }
    } catch (err) {
      console.error("RFQ DRAFT LOAD ERROR:", err);
    }
  }, [draftKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          quantity,
          unitType,
          deliveryCity,
          targetPrice,
          note,
          requestTitle,
          selectedRootId,
          selectedCategoryId,
          updatedAt: new Date().toISOString(),
        })
      );
    }, 350);

    return () => window.clearTimeout(timer);
  }, [
    draftKey,
    quantity,
    unitType,
    deliveryCity,
    targetPrice,
    note,
    requestTitle,
    selectedRootId,
    selectedCategoryId,
  ]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${BASE_URL}/api/categories`);
        const data = await res.json();

        if (!res.ok || !Array.isArray(data)) return;

        setCategories(data);

        if (initialCategory && !selectedCategoryId) {
          const decoded = decodeURIComponent(initialCategory);

          const found = data.find(
            (item: Category) =>
              item.id === decoded ||
              item.name.toLowerCase() === decoded.toLowerCase()
          );

          if (found) {
            setSelectedCategoryId(found.id);
            setSelectedRootId(found.parentId || found.id);

            if (!requestTitle && found.parentId) {
              setRequestTitle(found.name);
            }
          }
        }
      } catch (err) {
        console.error("CATEGORY LOAD ERROR:", err);
      }
    }

    loadCategories();
  }, [initialCategory]);

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;

      try {
        const res = await fetch(`${BASE_URL}/api/products/${productId}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    loadProduct();
  }, [productId]);

  const generateAiDraft = async () => {
    try {
      setAiLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!aiPrompt.trim()) {
        setError(t("createRfqPage.aiPromptRequired"));
        return;
      }

      const res = await fetch(`${BASE_URL}/api/ai/rfq-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("createRfqPage.aiDraftFailed"));
        return;
      }

      if (data.title) setRequestTitle(String(data.title));
      if (data.quantity) setQuantity(String(data.quantity));

      const promptLower = aiPrompt.toLocaleLowerCase("tr-TR");

      const detectedUnit =
        promptLower.includes("koli") ? "Koli" :
        promptLower.includes("paket") ? "Paket" :
        promptLower.includes("kilogram") || promptLower.includes(" kg") ? "Kilogram" :
        promptLower.includes("ton") ? "Ton" :
        promptLower.includes("litre") ? "Litre" :
        promptLower.includes("metre") ? "Metre" :
        promptLower.includes("palet") ? "Palet" :
        promptLower.includes("adet") ? "Adet" :
        "";

      if (detectedUnit) {
        setUnitType(detectedUnit);
      } else if (data.unitType) {
        setUnitType(String(data.unitType));
      }

      if (data.deliveryCity) setDeliveryCity(String(data.deliveryCity));
      if (data.targetPrice !== undefined && data.targetPrice !== null) {
        setTargetPrice(String(data.targetPrice));
      }

      if (!productId && data.categoryName && categories.length > 0) {
        const suggestedCategory = String(data.categoryName)
          .trim()
          .toLocaleLowerCase("tr-TR");

        const exactMatch = categories.find(
          (item) =>
            item.name.trim().toLocaleLowerCase("tr-TR") === suggestedCategory
        );

        const partialMatch =
          exactMatch ||
          categories.find((item) => {
            const categoryName = item.name
              .trim()
              .toLocaleLowerCase("tr-TR");

            return (
              categoryName.includes(suggestedCategory) ||
              suggestedCategory.includes(categoryName)
            );
          });

        if (partialMatch) {
          setSelectedCategoryId(partialMatch.id);
          setSelectedRootId(partialMatch.parentId || partialMatch.id);
        }
      }

      if (data.note) setNote(String(data.note));
    } catch (err) {
      console.error("AI RFQ ERROR:", err);
      setError(t("createRfqPage.aiError"));
    } finally {
      setAiLoading(false);
    }
  };

  const createRfq = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      if (!productId) {
        if (!selectedCategoryId) {
          setError(t("createRfqPage.categoryRequired"));
          return;
        }

        if (!requestTitle.trim()) {
          setError(t("createRfqPage.titleRequired"));
          return;
        }
      }

      if (!quantity || Number(quantity) < 1) {
        setError(t("createRfqPage.quantityRequired"));
        return;
      }

      if (!deliveryCity.trim()) {
        setError(t("createRfqPage.deliveryRequired"));
        return;
      }

      if (!note.trim()) {
        setError(t("createRfqPage.noteRequired"));
        return;
      }

      const selectedCategory = categories.find(
        (item) => item.id === selectedCategoryId
      );

      const finalNote = [
        selectedCategory ? `Kategori: ${selectedCategory.name}` : "",
        product?.title || productName || requestTitle
          ? `Talep: ${product?.title || productName || requestTitle}`
          : "",
        `Miktar Birimi: ${unitType}`,
        `Teslimat Şehri: ${deliveryCity.trim()}`,
        targetPrice
          ? `Hedef Fiyat: ${Number(targetPrice).toLocaleString("tr-TR")} ₺`
          : "",
        note.trim(),
      ]
        .filter(Boolean)
        .join("\n");

      const res = await fetch(`${BASE_URL}/api/rfqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productId || undefined,
          categoryId: productId ? undefined : selectedCategoryId,
          title: productId ? undefined : requestTitle.trim(),
          quantity: Number(quantity),
          unitType,
          note: finalNote,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("createRfqPage.createFailed"));
        return;
      }

      localStorage.removeItem(draftKey);
      setCreatedRfqId(data?.id || "created");
    } catch (err) {
      console.error(err);
      setError(t("createRfqPage.generalError"));
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryName =
    categories.find((item) => item.id === selectedCategoryId)?.name || "";

  const selectedTitle =
    product?.title ||
    productName ||
    requestTitle ||
    selectedCategoryName ||
    t("createRfqPage.generalRequest");

  const rootCategories = categories
    .filter((item) => !item.parentId)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const childCategories = categories
    .filter((item) => item.parentId === selectedRootId)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  if (createdRfqId) {
    return (
      <main style={successPageStyle}>
        <section style={successCardStyle}>
          <div style={successIconStyle}>✓</div>

          <div style={successEyebrowStyle}>{t("createRfqPage.published")}</div>

          <h1 style={successTitleStyle}>
            {t("createRfqPage.successTitle")}
          </h1>

          <p style={successTextStyle}>
            {t("createRfqPage.successText")}
          </p>

          <div style={successSummaryStyle}>
            <div>
              <span style={successSummaryLabelStyle}>{t("createRfqPage.request")}</span>
              <strong>{selectedTitle}</strong>
            </div>

            <div>
              <span style={successSummaryLabelStyle}>{t("createRfqPage.quantity")}</span>
              <strong>
                {quantity} {unitType}
              </strong>
            </div>

            <div>
              <span style={successSummaryLabelStyle}>{t("createRfqPage.delivery")}</span>
              <strong>{deliveryCity}</strong>
            </div>
          </div>

          <div style={successActionStyle}>
            <button
              type="button"
              onClick={() => navigate("/buyer/rfqs")}
              style={successPrimaryButtonStyle}
            >
              {t("createRfqPage.viewRequests")}
            </button>

            <button
              type="button"
              onClick={() => {
                setCreatedRfqId("");
                setQuantity("100");
                setUnitType("Adet");
                setDeliveryCity("");
                setTargetPrice("");
                setNote("");
                setRequestTitle("");
                setSelectedRootId("");
                setSelectedCategoryId("");
              }}
              style={successSecondaryButtonStyle}
            >
              {t("createRfqPage.createNew")}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={heroStyle}>
        <Link to="/" style={backLinkStyle}>
          ← {t("createRfqPage.backHome")}
        </Link>

        <div style={heroBadgeStyle}>{t("createRfqPage.heroBadge")}</div>

        <h1 style={heroTitleStyle}>{t("createRfqPage.heroTitle")}</h1>

        <p style={heroTextStyle}>
          {t("createRfqPage.heroText")}
        </p>

        <div style={benefitGridStyle}>
          <div style={benefitStyle}>✓ {t("createRfqPage.verifiedSuppliers")}</div>
          <div style={benefitStyle}>✓ {t("createRfqPage.secureProcess")}</div>
          <div style={benefitStyle}>✓ {t("createRfqPage.singlePanel")}</div>
        </div>
      </section>

      <section style={cardStyle}>
        <div style={cardHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>{t("createRfqPage.formBadge")}</div>
            <h2 style={titleStyle}>{t("createRfqPage.formTitle")}</h2>
          </div>

          <Link to="/products" style={secondaryLinkStyle}>
            {t("createRfqPage.backProducts")}
          </Link>
        </div>

        <div style={summaryBoxStyle}>
          <div>
            <div style={summaryLabelStyle}>{t("createRfqPage.selectedNeed")}</div>
            <strong style={summaryTitleStyle}>{selectedTitle}</strong>
          </div>

          {product?.basePrice && (
            <div style={pricePillStyle}>
              {Number(product.basePrice).toLocaleString(locale)} ₺ {t("createRfqPage.starting")}
            </div>
          )}
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <section style={aiBoxStyle}>
          <div style={aiBadgeStyle}>{t("createRfqPage.aiBadge")}</div>

          <h3 style={aiTitleStyle}>{t("createRfqPage.aiTitle")}</h3>

          <p style={aiTextStyle}>
            {t("createRfqPage.aiText")}
          </p>

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            style={aiTextareaStyle}
            placeholder={t("createRfqPage.aiPlaceholder")}
          />

          <button
            type="button"
            onClick={generateAiDraft}
            disabled={aiLoading}
            style={{
              ...aiButtonStyle,
              opacity: aiLoading ? 0.65 : 1,
              cursor: aiLoading ? "not-allowed" : "pointer",
            }}
          >
            {aiLoading ? t("createRfqPage.aiPreparing") : t("createRfqPage.fillWithAi")}
          </button>
        </section>

        {!productId && (
          <>
            <label style={fieldStyle}>
              <span style={labelStyle}>{t("createRfqPage.requestTitle")}</span>
              <input
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                style={inputStyle}
                placeholder={t("createRfqPage.requestTitlePlaceholder")}
              />
            </label>

            <div style={formGridStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>{t("createRfqPage.mainSector")}</span>
                <select
                  value={selectedRootId}
                  onChange={(e) => {
                    const rootId = e.target.value;
                    setSelectedRootId(rootId);
                    setSelectedCategoryId("");
                  }}
                  style={inputStyle}
                >
                  <option value="">{t("createRfqPage.selectMainSector")}</option>

                  {rootCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>{t("createRfqPage.subCategory")}</span>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  style={inputStyle}
                  disabled={!selectedRootId}
                >
                  <option value="">
                    {selectedRootId
                      ? t("createRfqPage.selectSubCategory")
                      : t("createRfqPage.selectMainFirst")}
                  </option>

                  {childCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}

                  {selectedRootId && childCategories.length === 0 && (
                    <option value={selectedRootId}>
                      {t("createRfqPage.mainCategory")}
                    </option>
                  )}
                </select>
              </label>
            </div>

            {selectedCategoryName && (
              <div style={infoBoxStyle}>
                <strong>{t("createRfqPage.selectedCategory")}</strong> {selectedCategoryName}
              </div>
            )}
          </>
        )}

        <div style={formGridStyle}>
          <label style={fieldStyle}>
            <span style={labelStyle}>{t("createRfqPage.quantity")} *</span>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
              placeholder={t("createRfqPage.quantityPlaceholder")}
            />
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>{t("createRfqPage.unit")}</span>
            <select
              value={unitType}
              onChange={(e) => setUnitType(e.target.value)}
              style={inputStyle}
            >
              <option value="Adet">{t("createRfqPage.piece")}</option>
              <option value="Koli">{t("createRfqPage.box")}</option>
              <option value="Paket">{t("createRfqPage.package")}</option>
              <option value="Kilogram">{t("createRfqPage.kilogram")}</option>
              <option value="Ton">{t("createRfqPage.ton")}</option>
              <option value="Litre">{t("createRfqPage.litre")}</option>
              <option value="Metre">{t("createRfqPage.meter")}</option>
              <option value="Palet">{t("createRfqPage.pallet")}</option>
            </select>
          </label>

          <label style={fieldStyle}>
            <span style={labelStyle}>{t("createRfqPage.targetPrice")}</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              style={inputStyle}
              placeholder={t("createRfqPage.optional")}
            />
          </label>
        </div>

        <label style={fieldStyle}>
          <span style={labelStyle}>{t("createRfqPage.deliveryCity")}</span>
          <select
            value={deliveryCity}
            onChange={(e) => setDeliveryCity(e.target.value)}
            style={inputStyle}
          >
            <option value="">{t("createRfqPage.selectCity")}</option>

            {TURKEY_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label style={fieldStyle}>
          <span style={labelStyle}>{t("createRfqPage.productDeliveryDetails")}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={textareaStyle}
            placeholder={t("createRfqPage.detailsPlaceholder")}
          />
        </label>

        <div style={draftNoticeStyle}>
          ✓ {t("createRfqPage.draftSaved")}
        </div>

        <div style={noticeStyle}>
          <strong>{t("createRfqPage.platformSecure")}</strong>
          <span>
            {t("createRfqPage.platformSecureText")}
          </span>
        </div>

        <button onClick={createRfq} disabled={loading} style={buttonStyle}>
          {loading ? t("createRfqPage.creating") : t("createRfqPage.createFree")}
        </button>
      </section>
    </main>
  );
}

const aiBoxStyle: CSSProperties = {
  background: "linear-gradient(135deg, #eff6ff, #f5f3ff)",
  border: "1px solid #c7d2fe",
  borderRadius: 20,
  padding: 20,
  marginBottom: 22,
};

const aiBadgeStyle: CSSProperties = {
  display: "inline-block",
  background: "#4f46e5",
  color: "white",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 10,
};

const aiTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 22,
  color: "#0f172a",
  fontWeight: 900,
};

const aiTextStyle: CSSProperties = {
  margin: "0 0 14px",
  color: "#475569",
  lineHeight: 1.6,
};

const aiTextareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 90,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  resize: "vertical",
  boxSizing: "border-box",
  fontSize: 15,
  marginBottom: 12,
  fontFamily: "inherit",
};

const aiButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 16px",
  background: "#4f46e5",
  color: "white",
  fontWeight: 900,
};

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 32%), #f8fafc",
  padding: window.innerWidth < 700 ? 12 : 32,
  display: "grid",
  gridTemplateColumns: window.innerWidth < 700 ? "1fr" : "0.8fr 1.2fr",
  gap: window.innerWidth < 700 ? 16 : 28,
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
};

const heroStyle: CSSProperties = {
  borderRadius: window.innerWidth < 700 ? 22 : 30,
  padding: window.innerWidth < 700 ? 22 : 34,
  color: "white",
  backgroundImage:
    "linear-gradient(180deg, rgba(15,23,42,0.45), rgba(15,23,42,0.92)), url('/images/hero-b2b.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  minHeight: window.innerWidth < 700 ? 360 : "calc(100vh - 64px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxShadow: "0 24px 60px rgba(15,23,42,0.22)",
};

const backLinkStyle: CSSProperties = {
  color: "#dbeafe",
  textDecoration: "none",
  fontWeight: 900,
};

const heroBadgeStyle: CSSProperties = {
  display: "inline-block",
  width: "fit-content",
  background: "rgba(59,130,246,0.24)",
  border: "1px solid rgba(147,197,253,0.28)",
  padding: "8px 13px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 900,
};

const heroTitleStyle: CSSProperties = {
  fontSize: window.innerWidth < 700 ? 32 : 46,
  lineHeight: 1.05,
  fontWeight: 900,
  margin: "20px 0 12px",
};

const heroTextStyle: CSSProperties = {
  color: "#dbeafe",
  lineHeight: 1.7,
  fontSize: 17,
};

const benefitGridStyle: CSSProperties = {
  display: "grid",
  gap: 10,
};

const benefitStyle: CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.14)",
  padding: 14,
  borderRadius: 16,
  fontWeight: 800,
};

const cardStyle: CSSProperties = {
  background: "white",
  borderRadius: 30,
  padding: 34,
  boxShadow: "0 24px 60px rgba(15,23,42,0.12)",
  border: "1px solid #e2e8f0",
};

const cardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  alignItems: "start",
  marginBottom: 24,
};

const eyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 900,
  marginBottom: 8,
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: window.innerWidth < 700 ? 28 : 34,
  lineHeight: 1.1,
  fontWeight: 900,
};

const secondaryLinkStyle: CSSProperties = {
  textDecoration: "none",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "11px 14px",
  borderRadius: 13,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const summaryBoxStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 20,
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  marginBottom: 16,
};

const summaryLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  fontWeight: 800,
  marginBottom: 5,
};

const summaryTitleStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 20,
};

const pricePillStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  borderRadius: 999,
  padding: "9px 12px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const infoBoxStyle: CSSProperties = {
  background: "#eff6ff",
  color: "#1e3a8a",
  padding: 14,
  borderRadius: 14,
  marginBottom: 16,
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: 14,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 16,
};

const labelStyle: CSSProperties = {
  color: "#334155",
  fontSize: 14,
  fontWeight: 900,
};

const inputStyle: CSSProperties = {
  height: 52,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  padding: "0 15px",
  fontSize: 15,
  outline: "none",
};

const textareaStyle: CSSProperties = {
  minHeight: 150,
  borderRadius: 14,
  border: "1px solid #cbd5e1",
  padding: 15,
  fontSize: 15,
  outline: "none",
  resize: "vertical",
};

const noticeStyle: CSSProperties = {
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  color: "#166534",
  borderRadius: 16,
  padding: 15,
  display: "grid",
  gap: 4,
  marginBottom: 18,
};

const buttonStyle: CSSProperties = {
  width: "100%",
  height: 56,
  border: "none",
  borderRadius: 16,
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  color: "white",
  fontSize: 16,
  fontWeight: 900,
  cursor: "pointer",
};


const errorStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};
const draftNoticeStyle: CSSProperties = {
  marginBottom: 14,
  padding: "11px 13px",
  borderRadius: 12,
  color: "#166534",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  fontSize: 13,
  fontWeight: 800,
};

const successPageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: 32,
  display: "grid",
  placeItems: "center",
  background:
    "radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 36%), #f8fafc",
};

const successCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 760,
  padding: 42,
  borderRadius: 30,
  background: "#ffffff",
  border: "1px solid #dbeafe",
  boxShadow: "0 28px 70px rgba(15,23,42,0.14)",
  textAlign: "center",
};

const successIconStyle: CSSProperties = {
  width: 76,
  height: 76,
  margin: "0 auto 20px",
  display: "grid",
  placeItems: "center",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#15803d",
  fontSize: 38,
  fontWeight: 900,
};

const successEyebrowStyle: CSSProperties = {
  color: "#16a34a",
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: 0.8,
};

const successTitleStyle: CSSProperties = {
  margin: "10px 0 12px",
  color: "#0f172a",
  fontSize: 36,
  lineHeight: 1.15,
  fontWeight: 900,
};

const successTextStyle: CSSProperties = {
  maxWidth: 580,
  margin: "0 auto",
  color: "#64748b",
  lineHeight: 1.7,
  fontSize: 16,
};

const successSummaryStyle: CSSProperties = {
  margin: "26px 0",
  padding: 18,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 12,
  borderRadius: 20,
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  textAlign: "left",
};

const successSummaryLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 5,
  color: "#64748b",
  fontSize: 12,
  fontWeight: 800,
};

const successActionStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: 12,
};

const successPrimaryButtonStyle: CSSProperties = {
  minWidth: 190,
  minHeight: 50,
  border: "none",
  borderRadius: 14,
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
};

const successSecondaryButtonStyle: CSSProperties = {
  minWidth: 190,
  minHeight: 50,
  border: "1px solid #cbd5e1",
  borderRadius: 14,
  background: "#ffffff",
  color: "#334155",
  fontWeight: 900,
  cursor: "pointer",
};
