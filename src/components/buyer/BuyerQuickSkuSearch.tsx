import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type Product = {
  id: string;
  title?: string;
  sku?: string | null;
  variants?: Array<{
    sku?: string | null;
    isActive?: boolean;
  }>;
};

const texts = {
  tr: ["Hızlı SKU Siparişi", "Ürün SKU kodu", "SKU girin", "Ürün Bul", "Aranıyor...", "Eşleşen ürün bulunamadı.", "Arama başarısız. Tekrar deneyin.", "Ürünü Gör", "Miktar ve varyantı ürün detayında seçebilirsiniz.", "Çok fazla sonuç var. Daha belirgin SKU girin."],
  en: ["Quick SKU Order", "Product SKU", "Enter SKU", "Find Product", "Searching...", "No matching product found.", "Search failed. Please retry.", "View Product", "Select quantity and variant on the product page.", "Too many results. Enter a more specific SKU."],
  de: ["SKU-Schnellbestellung", "Produkt-SKU", "SKU eingeben", "Produkt finden", "Suche...", "Kein Produkt gefunden.", "Suche fehlgeschlagen.", "Produkt ansehen", "Menge und Variante auf der Produktseite wählen.", "Zu viele Ergebnisse. SKU präzisieren."],
  ru: ["Быстрый заказ по SKU", "SKU товара", "Введите SKU", "Найти товар", "Поиск...", "Товар не найден.", "Ошибка поиска.", "Открыть товар", "Выберите количество и вариант на странице товара.", "Слишком много результатов. Уточните SKU."],
  ka: ["სწრაფი SKU შეკვეთა", "პროდუქტის SKU", "შეიყვანეთ SKU", "პროდუქტის ძებნა", "იძებნება...", "პროდუქტი ვერ მოიძებნა.", "ძიება ვერ შესრულდა.", "პროდუქტის ნახვა", "რაოდენობა და ვარიანტი აირჩიეთ პროდუქტის გვერდზე.", "ძალიან ბევრი შედეგია. მიუთითეთ ზუსტი SKU."],
  ar: ["طلب سريع برمز SKU", "رمز المنتج", "أدخل SKU", "بحث", "جارٍ البحث...", "لم يتم العثور على منتج.", "فشل البحث.", "عرض المنتج", "اختر الكمية والمتغير من صفحة المنتج.", "نتائج كثيرة. أدخل رمزًا أكثر تحديدًا."],
  uz: ["SKU orqali tez buyurtma", "Mahsulot SKU kodi", "SKU kiriting", "Mahsulotni topish", "Qidirilmoqda...", "Mahsulot topilmadi.", "Qidiruvda xatolik.", "Mahsulotni ko‘rish", "Miqdor va variantni mahsulot sahifasida tanlang.", "Natijalar ko‘p. Aniqroq SKU kiriting."]
};

function matches(value: unknown, sku: string): boolean {
  return typeof value === "string" &&
    value.trim().toLowerCase() === sku.toLowerCase();
}

export default function BuyerQuickSkuSearch() {
  const { i18n } = useTranslation();
  const language = i18n.language.split("-")[0].toLowerCase();
  const t = texts[language as keyof typeof texts] || texts.tr;

  const [sku, setSku] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = sku.trim();

    if (!term || loading) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setResults([]);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/products?q=${encodeURIComponent(term)}&lang=${encodeURIComponent(language)}`,
        { signal: controller.signal, cache: "no-store" }
      );

      if (!response.ok) throw new Error("Search failed");

      const payload: unknown = await response.json();

      const list: unknown = Array.isArray(payload)
        ? payload
        : payload && typeof payload === "object"
          ? (payload as { products?: unknown; data?: unknown }).products ??
            (payload as { data?: unknown }).data
          : null;

      if (!Array.isArray(list)) {
        throw new Error("Invalid response");
      }

      const candidates: Product[] = list.filter(
        (item: unknown): item is Product =>
          item !== null &&
          typeof item === "object" &&
          typeof (item as Product).id === "string"
      );

      if (candidates.length > 50) {
        setMessage(t[9]);
        return;
      }

      const matched: Array<Product | null> = await Promise.all(
        candidates.map(async (product): Promise<Product | null> => {
          const res = await fetch(
            `${API}/products/${encodeURIComponent(product.id)}?lang=${encodeURIComponent(language)}`,
            { signal: controller.signal, cache: "no-store" }
          );

          if (!res.ok) throw new Error("Product detail failed");

          const detail: Product = await res.json();

          if (!detail || detail.id !== product.id) {
            throw new Error("Invalid product");
          }

          const productMatch =
            matches(detail.sku, term) || matches(product.sku, term);

          const variantMatch =
            Array.isArray(detail.variants) &&
            detail.variants.some(
              v => v.isActive !== false && matches(v.sku, term)
            );

          if (!productMatch && !variantMatch) return null;

          return {
            id: product.id,
            title: detail.title || product.title
          };
        })
      );

      if (controller.signal.aborted) return;

      const exact: Product[] = matched.filter(
        (item): item is Product => item !== null
      );

      const unique: Product[] = Array.from(
        new Map(exact.map(item => [item.id, item])).values()
      );

      setResults(unique);
      if (!unique.length) setMessage(t[5]);

    } catch {
      if (!controller.signal.aborted) setMessage(t[6]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <section style={{
      background: "#fff",
      border: "1px solid #99f6e4",
      borderRadius: 14,
      padding: 20,
      marginBottom: 24
    }}>
      <h2 style={{ color: "#0f766e", marginTop: 0 }}>
        {t[0]}
      </h2>

      <form onSubmit={search} style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "end"
      }}>
        <label style={{ flex: "1 1 220px" }}>
          <span style={{ display: "block", marginBottom: 6 }}>
            {t[1]}
          </span>
          <input
            value={sku}
            onChange={event => setSku(event.target.value)}
            placeholder={t[2]}
            required
            maxLength={100}
            disabled={loading}
            autoComplete="off"
            style={{
              boxSizing: "border-box",
              width: "100%",
              padding: 12,
              borderRadius: 9,
              border: "1px solid #94a3b8"
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading || !sku.trim()}
          style={{
            background: "#f97316",
            color: "white",
            padding: "12px 20px",
            border: 0,
            borderRadius: 9,
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer"
          }}
        >
          {loading ? t[4] : t[3]}
        </button>
      </form>

      {loading && <p role="status">{t[4]}</p>}

      {message && !loading && (
        <p role="status">{message}</p>
      )}

      {!loading && results.map(product => (
        <div key={product.id} style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: 12,
          marginTop: 10,
          borderBottom: "1px solid #e2e8f0"
        }}>
          <strong>{product.title || sku}</strong>
          <Link
            to={`/product/${encodeURIComponent(product.id)}`}
            style={{ color: "#0f766e", fontWeight: 700 }}
          >
            {t[7]}
          </Link>
        </div>
      ))}

      {results.length > 0 && !loading && (
        <p style={{ color: "#475569", fontSize: 13 }}>
          {t[8]}
        </p>
      )}
    </section>
  );
}
