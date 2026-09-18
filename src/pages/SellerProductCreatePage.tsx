import { useEffect, useState, type CSSProperties } from "react";
import SellerLayout from "../components/SellerLayout";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { COUNTRIES } from "../constants/countries";
import { TURKEY_CITIES } from "../constants/turkeyCities";

const BASE_URL = "https://tedarik-backend.onrender.com";

type Category = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Category[];
};

type UploadedImage = {
  url: string;
  sortOrder: number;
  isCover: boolean;
};

export default function SellerProductCreatePage() {
  const { t, i18n } = useTranslation();
  const { id: editProductId } = useParams();
  const isEditMode = Boolean(editProductId);

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );
  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mainCategoryId, setMainCategoryId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [country, setCountry] = useState("Türkiye");
  const [city, setCity] = useState("");
  const [unitType, setUnitType] = useState("adet");
  const [moq, setMoq] = useState("1");
  const [leadTimeDays, setLeadTimeDays] = useState("3");
  const [stockType, setStockType] = useState("STOCK");
  const [vatRate, setVatRate] = useState("20");

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch(`${BASE_URL}/api/categories/tree?lang=${encodeURIComponent(i18n.language)}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error(t("sellerProductCreatePage.categoryLoadError"), err);
      }
    }

    loadCategories();
  }, [i18n.language, t]);

  useEffect(() => {
    if (!isEditMode || !editProductId || categories.length === 0) return;

    async function loadProductForEdit() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("sellerProductCreatePage.loginRequired"));
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/products/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || "Ürün bilgileri yüklenemedi.");
          return;
        }

        const product = Array.isArray(data)
          ? data.find((item: any) => item.id === editProductId)
          : null;

        if (!product) {
          setError("Düzenlenecek ürün bulunamadı.");
          return;
        }

        setTitle(product.title || "");
        setDescription(product.description || "");
        setCategoryId(product.categoryId || "");
        setBasePrice(String(product.basePrice ?? ""));
        setCountry(product.country || "Türkiye");
        setCity(product.city || "");
        setUnitType(product.unitType || "adet");
        setMoq(String(product.moq ?? 1));
        setLeadTimeDays(String(product.leadTimeDays ?? 3));
        setStockType(product.stockType || "STOCK");
        setVatRate(String(product.vatRate ?? 20));

        const parent = categories.find((main) =>
          main.children?.some((child) => child.id === product.categoryId)
        );

        if (parent) {
          setMainCategoryId(parent.id);
        } else if (categories.some((main) => main.id === product.categoryId)) {
          setMainCategoryId(product.categoryId);
        }

        const existingImages = Array.isArray(product.images)
          ? product.images.map((image: any, index: number) => ({
              url: image.url,
              sortOrder: image.sortOrder ?? index,
              isCover: image.isCover ?? index === 0,
            }))
          : [];

        if (existingImages.length > 0) {
          setUploadedImages(existingImages);
        } else if (product.imageUrl) {
          setUploadedImages([
            {
              url: product.imageUrl,
              sortOrder: 0,
              isCover: true,
            },
          ]);
        }
      } catch (err) {
        console.error(err);
        setError("Ürün bilgileri yüklenirken bir hata oluştu.");
      }
    }

    loadProductForEdit();
  }, [isEditMode, editProductId, categories, t]);

  const generateAiDraft = async () => {
    setError("");
    setMessage("");

    if (!aiPrompt.trim()) {
      setError(t("sellerProductCreatePage.aiPromptRequired"));
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError(t("sellerProductCreatePage.loginRequired"));
      return;
    }

    try {
      setAiLoading(true);

      const res = await fetch(`${BASE_URL}/api/ai/product-draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt: aiPrompt.trim(), language: i18n.language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("sellerProductCreatePage.aiFailed"));
        return;
      }

      if (data.title) setTitle(String(data.title));
      if (data.description) setDescription(String(data.description));
      if (data.moq) setMoq(String(data.moq));
      if (data.leadTimeDays) setLeadTimeDays(String(data.leadTimeDays));

      if (data.unitType) {
        const unit = String(data.unitType).toLocaleLowerCase("tr-TR");
        const unitMap: Record<string, string> = {
          adet: "adet",
          koli: "koli",
          kutu: "koli",
          kg: "kg",
          kilogram: "kg",
          litre: "litre",
          liter: "litre",
          metre: "metre",
          meter: "metre",
          paket: "paket",
        };

        if (unitMap[unit]) {
          setUnitType(unitMap[unit]);
        }
      }

      if (data.categoryName && categories.length > 0) {
        const suggested = String(data.categoryName)
          .trim()
          .toLocaleLowerCase("tr-TR");

        let matchedMain: Category | undefined;
        let matchedChild: Category | undefined;

        for (const main of categories) {
          const mainName = main.name.trim().toLocaleLowerCase("tr-TR");

          if (
            mainName === suggested ||
            mainName.includes(suggested) ||
            suggested.includes(mainName)
          ) {
            matchedMain = main;
            break;
          }

          const child = (main.children || []).find((item) => {
            const childName = item.name.trim().toLocaleLowerCase("tr-TR");
            return (
              childName === suggested ||
              childName.includes(suggested) ||
              suggested.includes(childName)
            );
          });

          if (child) {
            matchedMain = main;
            matchedChild = child;
            break;
          }
        }

        if (matchedMain) {
          setMainCategoryId(matchedMain.id);

          if (matchedChild) {
            setCategoryId(matchedChild.id);
          } else if ((matchedMain.children || []).length === 1) {
            setCategoryId(matchedMain.children![0].id);
          } else {
            setCategoryId("");
          }
        }
      }
    } catch (err) {
      console.error("AI PRODUCT ERROR:", err);
      setError(t("sellerProductCreatePage.aiError"));
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setError("");
    setMessage("");
    setUploading(true);

    const fileArray = Array.from(files);
    setSelectedFileNames(fileArray.map((file) => file.name));

    try {
      const formData = new FormData();

      fileArray.forEach((file) => {
        formData.append("files", file);
      });

      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/api/upload/multiple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || t("sellerProductCreatePage.uploadFailed"));
        setUploadedImages([]);
        return;
      }

      const images = Array.isArray(data?.images) ? data.images : [];

      const withCover = images.map((img: any, index: number) => ({
        ...img,
        isCover: index === 0,
      }));

      setUploadedImages(withCover);
      setMessage(t("sellerProductCreatePage.uploadSuccess"));
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError(t("sellerProductCreatePage.uploadError"));
      setUploadedImages([]);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");

      const priceValue = Number(basePrice);
      const moqValue = Number(moq);
      const leadTimeValue = Number(leadTimeDays);
      const vatValue = Number(vatRate);

      if (!Number.isFinite(priceValue) || priceValue <= 0) {
        setError("KDV dahil birim fiyat 0 ₺'den büyük olmalıdır.");
        return;
      }

      if (!Number.isInteger(moqValue) || moqValue < 1) {
        setError("Minimum sipariş miktarı (MOQ) en az 1 olmalıdır.");
        return;
      }

      if (!Number.isInteger(leadTimeValue) || leadTimeValue < 1) {
        setError("Kargoya hazırlama süresi en az 1 iş günü olmalıdır.");
        return;
      }

      if (![0, 1, 10, 20].includes(vatValue)) {
        setError("Geçerli bir KDV oranı seçin.");
        return;
      }

      setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(t("sellerProductCreatePage.loginRequired"));
        return;
      }

      const coverImage =
        uploadedImages.find((img) => img.isCover)?.url || uploadedImages[0]?.url;

      const productRes = await fetch(
        isEditMode && editProductId
          ? `${BASE_URL}/api/products/${editProductId}`
          : `${BASE_URL}/api/products`,
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            categoryId,
            country,
            city,
            unitType,
            moq: moqValue,
            basePrice: priceValue,
            leadTimeDays: leadTimeValue,
            stockType,
            vatRate: vatValue,
            rfqEnabled: true,
            imageUrl: coverImage,
          }),
        }
      );

      const savedProduct = await productRes.json();

      if (!productRes.ok) {
        setError(
          savedProduct?.message ||
            (isEditMode
              ? "Ürün güncellenemedi."
              : t("sellerProductCreatePage.createFailed"))
        );
        return;
      }

      if (!isEditMode && uploadedImages.length > 0) {
        await fetch(`${BASE_URL}/api/products/${savedProduct.id}/images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            images: uploadedImages,
          }),
        });
      }

      setMessage(
        isEditMode
          ? "Ürün başarıyla güncellendi."
          : t("sellerProductCreatePage.createSuccess")
      );

      if (!isEditMode) {
        setTitle("");
        setDescription("");
        setMainCategoryId("");
        setCategoryId("");
        setBasePrice("");
        setCountry("Türkiye");
        setCity("");
        setUnitType("adet");
        setMoq("1");
        setLeadTimeDays("3");
        setStockType("STOCK");
        setVatRate("20");
        setUploadedImages([]);
        setSelectedFileNames([]);
        setAiPrompt("");
      }
    } catch (err) {
      console.error("CREATE ERROR:", err);
      setError(t("sellerProductCreatePage.createError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SellerLayout
      title={isEditMode ? "Ürünü Düzenle" : t("sellerProductCreatePage.title")}
    >
      <main
        style={{
          ...pageStyle,
          minHeight: isMobile ? "auto" : "100vh",
          padding: isMobile ? "8px 0 28px" : "20px 0",
        }}
      >
        <div
          style={{
            ...cardStyle,
            maxWidth: isMobile ? "100%" : 1000,
            padding: isMobile ? 20 : 40,
            borderRadius: isMobile ? 18 : 24,
            boxSizing: "border-box",
          }}
        >
          <p
            style={{
              ...subtitleStyle,
              marginTop: 0,
            }}
          >
            {t("sellerProductCreatePage.subtitle")}
          </p>

          {message && <div style={successStyle}>{message}</div>}
          {error && <div style={errorStyle}>{error}</div>}

          <form
            onSubmit={handleCreateProduct}
            style={{
              ...formStyle,
              padding: isMobile ? 16 : 24,
            }}
          >
            <section style={aiBoxStyle}>
              <div style={aiBadgeStyle}>
                {t("sellerProductCreatePage.aiBadge")}
              </div>

              <h3 style={aiTitleStyle}>
                {t("sellerProductCreatePage.aiTitle")}
              </h3>

              <p style={aiTextStyle}>
                {t("sellerProductCreatePage.aiText")}
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t("sellerProductCreatePage.aiPlaceholder")}
                style={aiPromptStyle}
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
                {aiLoading
                  ? t("sellerProductCreatePage.aiLoading")
                  : t("sellerProductCreatePage.aiButton")}
              </button>
            </section>

            <div
              style={{
                ...gridStyle,
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              }}
            >
              <input
                placeholder={t("sellerProductCreatePage.productName")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                required
              />

              <div>
                <label style={fieldLabelStyle}>
                  KDV Dahil Birim Fiyat (₺)
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="Örn. 90"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  style={inputStyle}
                  required
                />

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: "#64748b",
                  }}
                >
                  Bir satış birimi için alıcının ödeyeceği KDV dahil fiyatı
                  girin. Örneğin 1 adet 90 ₺ ise buraya 90 yazın.
                </div>
              </div>

              <select
                value={mainCategoryId}
                onChange={(e) => {
                  setMainCategoryId(e.target.value);
                  setCategoryId("");
                }}
                style={inputStyle}
                required
              >
                <option value="">{t("sellerProductCreatePage.selectMainCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={inputStyle}
                required
                disabled={!mainCategoryId}
              >
                <option value="">{t("sellerProductCreatePage.selectSubCategory")}</option>
                {(categories.find((c) => c.id === mainCategoryId)?.children || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  setCity("");
                }}
                style={inputStyle}
                required
              >
                <option value="">{t("sellerProductCreatePage.selectCountry")}</option>
                {COUNTRIES.map((countryName) => (
                  <option key={countryName} value={countryName}>
                    {countryName}
                  </option>
                ))}
              </select>

              {country === "Türkiye" ? (
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">{t("sellerProductCreatePage.selectCity")}</option>
                  {TURKEY_CITIES.map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("sellerProductCreatePage.city")}
                  style={inputStyle}
                  required
                />
              )}

              <div>
                <label style={fieldLabelStyle}>Satış Birimi</label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="adet">{t("sellerProductCreatePage.piece")}</option>
                  <option value="koli">{t("sellerProductCreatePage.box")}</option>
                  <option value="kg">{t("sellerProductCreatePage.kilogramShort")}</option>
                  <option value="litre">{t("sellerProductCreatePage.litre")}</option>
                  <option value="metre">{t("sellerProductCreatePage.meter")}</option>
                  <option value="paket">{t("sellerProductCreatePage.package")}</option>
                </select>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Birim fiyatın hangi satış birimi için geçerli olduğunu seçin.
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>
                  Minimum Sipariş Miktarı (MOQ)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                  style={inputStyle}
                  required
                />
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Alıcının verebileceği en düşük sipariş miktarı.
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>
                  Kargoya Hazırlama Süresi
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  value={leadTimeDays}
                  onChange={(e) => setLeadTimeDays(e.target.value)}
                  style={inputStyle}
                  required
                />
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Siparişten sonra en geç kaç iş günü içinde kargoya verilir?
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>Stok / Tedarik Durumu</label>
                <select
                  value={stockType}
                  onChange={(e) => setStockType(e.target.value)}
                  style={inputStyle}
                >
                  <option value="STOCK">
                    {t("sellerProductCreatePage.stockInStock")}
                  </option>
                  <option value="ON_DEMAND">
                    {t("sellerProductCreatePage.stockOnDemand")}
                  </option>
                </select>
              </div>

              <div>
                <label style={fieldLabelStyle}>KDV Oranı</label>
                <select
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  style={inputStyle}
                >
                  <option value="0">{t("sellerProductCreatePage.vat0")}</option>
                  <option value="1">{t("sellerProductCreatePage.vat1")}</option>
                  <option value="10">{t("sellerProductCreatePage.vat10")}</option>
                  <option value="20">{t("sellerProductCreatePage.vat20")}</option>
                </select>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  Birim fiyat KDV dahildir. Seçilen KDV oranı fiyata tekrar
                  eklenmez.
                </div>
              </div>

              <div
                style={{
                  padding: 16,
                  border: "1px solid #dbeafe",
                  borderRadius: 12,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    marginBottom: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#475569",
                  }}
                >
                  Minimum sipariş toplamı
                </div>

                {Number(basePrice) > 0 && Number(moq) > 0 ? (
                  <>
                    <div
                      style={{
                        marginBottom: 4,
                        fontSize: 13,
                        color: "#64748b",
                      }}
                    >
                      {Number(moq).toLocaleString("tr-TR")} {unitType} ×{" "}
                      {Number(basePrice).toLocaleString("tr-TR")} ₺
                    </div>

                    <strong
                      style={{
                        display: "block",
                        fontSize: 24,
                        lineHeight: 1.2,
                        color: "#0f172a",
                      }}
                    >
                      {(Number(basePrice) * Number(moq)).toLocaleString("tr-TR")} ₺
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 11,
                        color: "#64748b",
                      }}
                    >
                      KDV dahil
                    </span>
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "#64748b",
                    }}
                  >
                    Birim fiyat ve minimum sipariş miktarını girdiğinizde toplam
                    burada otomatik hesaplanır.
                  </div>
                )}
              </div>

              <input
                type="file"
                multiple
                onChange={handleFileChange}
                style={inputStyle}
              />
            </div>

            <textarea
              placeholder={t("sellerProductCreatePage.description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={textareaStyle}
            />

            {selectedFileNames.length > 0 && (
              <div style={fileBoxStyle}>
                {selectedFileNames.map((name, i) => (
                  <div key={i}>📷 {name}</div>
                ))}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div style={imageGridStyle}>
                {uploadedImages.map((img, i) => (
                  <img
                    key={i}
                    src={`${BASE_URL}${img.url}`}
                    style={imageStyle}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                ...buttonStyle,
                opacity: saving || uploading ? 0.7 : 1,
                cursor: saving || uploading ? "not-allowed" : "pointer",
              }}
            >
              {uploading
                ? t("sellerProductCreatePage.uploading")
                : saving
                ? t("sellerProductCreatePage.saving")
                : isEditMode
                ? "Değişiklikleri Kaydet"
                : t("sellerProductCreatePage.save")}
            </button>
          </form>
        </div>
      </main>
    </SellerLayout>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "20px 0",
};

const cardStyle: CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  background: "#ffffff",
  borderRadius: 24,
  padding: 40,
  boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
};

const titleStyle: CSSProperties = {
  fontSize: 38,
  fontWeight: 800,
  marginBottom: 10,
  color: "#0f172a",
};

const subtitleStyle: CSSProperties = {
  color: "#64748b",
  marginBottom: 30,
};

const formStyle: CSSProperties = {
  background: "#f8fafc",
  padding: 24,
  borderRadius: 20,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  marginBottom: 20,
};

const fieldLabelStyle: CSSProperties = {
  display: "block",
  marginBottom: 6,
  fontSize: 13,
  fontWeight: 600,
  color: "#475569",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 52,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: "0 16px",
  fontSize: 15,
  boxSizing: "border-box",
  background: "#fff",
};

const textareaStyle: CSSProperties = {
  width: "100%",
  minHeight: 140,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  padding: 16,
  fontSize: 15,
  boxSizing: "border-box",
  marginBottom: 20,
  resize: "vertical",
};

const buttonStyle: CSSProperties = {
  width: "100%",
  height: 54,
  border: "none",
  borderRadius: 14,
  background: "#2563eb",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
};

const successStyle: CSSProperties = {
  background: "#dcfce7",
  color: "#166534",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};

const errorStyle: CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 14,
  borderRadius: 12,
  marginBottom: 16,
};

const imageGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
  gap: 16,
  marginBottom: 20,
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  borderRadius: 14,
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const fileBoxStyle: CSSProperties = {
  background: "#e2e8f0",
  padding: 16,
  borderRadius: 12,
  marginBottom: 20,
};

const aiBoxStyle: CSSProperties = {
  background: "#eef6ff",
  border: "1px solid #bfdbfe",
  borderRadius: 16,
  padding: 20,
  marginBottom: 22,
};

const aiBadgeStyle: CSSProperties = {
  display: "inline-block",
  fontSize: 12,
  fontWeight: 800,
  color: "#1d4ed8",
  marginBottom: 8,
};

const aiTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 20,
  color: "#0f172a",
};

const aiTextStyle: CSSProperties = {
  margin: "0 0 14px",
  color: "#475569",
  lineHeight: 1.6,
};

const aiPromptStyle: CSSProperties = {
  width: "100%",
  minHeight: 90,
  border: "1px solid #93c5fd",
  borderRadius: 12,
  padding: 14,
  fontSize: 15,
  boxSizing: "border-box",
  resize: "vertical",
  background: "#fff",
  marginBottom: 12,
};

const aiButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 12,
  background: "#1d4ed8",
  color: "#fff",
  padding: "13px 18px",
  fontSize: 15,
  fontWeight: 700,
};
