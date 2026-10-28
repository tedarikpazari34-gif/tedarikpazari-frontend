import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type CartItem = {
  productId: string;
  variantId?: string | null;
  variantName?: string | null;
  variantSku?: string | null;
  title: string;
  quantity: number;
  moq?: number;
  quantityStep?: number;
  unitType: string;
  unitPrice: number;
  sellerId?: string | null;
  imageUrl?: string | null;
};

const cartItemKey = (item: CartItem) =>
  JSON.stringify([item.productId, item.variantId ?? null]);

// Backend Decimal ROUND_HALF_UP ile aynı kuruş yuvarlamasını uygular.
const calculateExpectedTotalAmount = (
  rawPrice: string | number | null | undefined,
  quantity: number
): string | null => {
  const price = String(rawPrice ?? "").trim();

  if (
    !Number.isSafeInteger(quantity) ||
    quantity <= 0 ||
    price.length > 70 ||
    !/^\\d+(?:\\.\\d{1,30})?$/.test(price)
  ) {
    return null;
  }

  const [whole, fraction = ""] = price.split(".");
  const scale = 10n ** BigInt(fraction.length);
  const numerator =
    BigInt(whole + fraction) * BigInt(quantity) * 100n;

  const cents = (numerator * 2n + scale) / (2n * scale);

  return `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
};

const formatMoney = (
  amount: string | null,
  locale: string
): string => {
  if (!amount || !/^\\d+\\.\\d{2}$/.test(amount)) {
    return "—";
  }

  const [lira, kurus] = amount.split(".");
  const separator = locale.startsWith("en") ? "." : ",";

  return `${BigInt(lira).toLocaleString(locale)}${separator}${kurus}`;
};

const formatUnitPrice = (
  amount: number,
  locale: string
): string => {
  const value = String(amount);

  if (!Number.isFinite(amount) || amount < 0 ||
      !/^\d+(?:\.\d+)?$/.test(value)) {
    return "—";
  }

  const [whole, fraction = ""] = value.split(".");
  const separator = locale.startsWith("en") ? "." : ",";

  return `${BigInt(whole).toLocaleString(locale)}${separator}${fraction.padEnd(2, "0")}`;
};

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const locale = i18n.language.startsWith("en") ? "en-US" : "tr-TR";

  const [items, setItems] = useState<CartItem[]>([]);
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState("");

  const loadCart = () => {
    try {
      const raw = localStorage.getItem("tedarikCart");
      const parsed = raw ? JSON.parse(raw) : [];
      const cartItems: CartItem[] = Array.isArray(parsed) ? parsed : [];

      setItems(cartItems);
      setQuantityInputs(
        Object.fromEntries(
          cartItems.map((item) => [cartItemKey(item), String(item.quantity)])
        )
      );
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleChange = () => loadCart();
    window.addEventListener("tedarik-cart-changed", handleChange);

    return () => {
      window.removeEventListener("tedarik-cart-changed", handleChange);
    };
  }, []);

  const total = useMemo(() => {
    let totalCents = 0n;

    for (const item of items) {
      const lineAmount = calculateExpectedTotalAmount(
        item.unitPrice,
        item.quantity
      );

      if (!lineAmount) return null;

      const [lira, kurus] = lineAmount.split(".");
      totalCents += BigInt(lira) * 100n + BigInt(kurus);
    }

    return `${totalCents / 100n}.${String(totalCents % 100n).padStart(2, "0")}`;
  }, [items]);

  const saveItems = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("tedarikCart", JSON.stringify(next));
    window.dispatchEvent(new Event("tedarik-cart-changed"));
  };

  const removeItem = (target: CartItem) => {
    const key = cartItemKey(target);
    saveItems(items.filter((item) => cartItemKey(item) !== key));
  };

  const getMinimumQuantity = (item: CartItem) =>
    Math.max(Number(item.moq || 1), 1);

  const getQuantityStep = (item: CartItem) =>
    getMinimumQuantity(item);

  const commitQuantity = (item: CartItem, requestedQuantity: number) => {
    const minimum = getMinimumQuantity(item);
    const step = getQuantityStep(item);

    const normalized =
      Number.isInteger(requestedQuantity) && requestedQuantity >= minimum
        ? minimum +
          Math.ceil((requestedQuantity - minimum) / step) * step
        : minimum;

    setQuantityInputs((current) => ({
      ...current,
      [cartItemKey(item)]: String(normalized),
    }));

    saveItems(
      items.map((currentItem) =>
        cartItemKey(currentItem) === cartItemKey(item)
          ? { ...currentItem, quantity: normalized }
          : currentItem
      )
    );
  };

  const handleQuantityInput = (item: CartItem, value: string) => {
    setQuantityInputs((current) => ({
      ...current,
      [cartItemKey(item)]: value,
    }));

    if (value === "") return;

    const next = Number(value);

    if (Number.isInteger(next) && next > 0) {
      setItems((current) =>
        current.map((currentItem) =>
          cartItemKey(currentItem) === cartItemKey(item)
            ? { ...currentItem, quantity: next }
            : currentItem
        )
      );
    }
  };

  const checkoutItem = async (item: CartItem) => {
    if (loadingId) return;

    const minimum = getMinimumQuantity(item);
    const step = getQuantityStep(item);

    if (
      !Number.isInteger(item.quantity) ||
      item.quantity < minimum ||
      (item.quantity - minimum) % step !== 0
    ) {
      commitQuantity(item, item.quantity);
      alert(t("productDetailPage.cartInvalidQuantity"));
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate(`/login?returnUrl=${encodeURIComponent("/cart")}`);
      return;
    }

    if (role !== "BUYER") {
      alert(t("cartPage.buyerOnly"));
      return;
    }

    try {
      setLoadingId(cartItemKey(item));

      // Sipariş oluşturmadan önce güncel ürün bilgilerini doğrula.
      const detailRes = await fetch(
        `${API}/products/${encodeURIComponent(item.productId)}?lang=${encodeURIComponent(i18n.language)}`
      );

      const detail = await detailRes.json().catch(() => null) as {
        id?: string;
        hasVariants?: boolean;
        variants?: Array<{
          id: string;
          name?: string;
          price?: string | number | null;
          availableStock?: number | null;
        }>;
        basePrice?: string | number;
        moq?: number;
        quantityStep?: number;
        availableStock?: number | null;
      } | null;

      if (
        !detailRes.ok ||
        !detail ||
        detail.id !== item.productId ||
        typeof detail.hasVariants !== "boolean" ||
        !Array.isArray(detail.variants)
      ) {
        alert("Güncel ürün bilgileri doğrulanamadı. Ödeme başlatılmadı.");
        return;
      }

      const variant = item.variantId
        ? detail.variants.find((entry) => entry.id === item.variantId)
        : null;

      if (
        (item.variantId && !variant) ||
        (!item.variantId && detail.hasVariants)
      ) {
        alert("Ürünün varyant bilgileri değişmiş. Lütfen yeniden seçim yapın.");
        navigate(`/product/${encodeURIComponent(item.productId)}`);
        return;
      }

      const freshPrice = Number(variant?.price ?? detail.basePrice);
      const freshMoq = Number(detail.moq);
      const freshStep = freshMoq;
      const availableStock = variant
        ? variant.availableStock
        : detail.availableStock;

      if (
        !Number.isFinite(freshPrice) ||
        freshPrice <= 0 ||
        !Number.isSafeInteger(freshMoq) ||
        freshMoq < 1 ||
        !Number.isSafeInteger(freshStep) ||
        freshStep < 1 ||
        availableStock === undefined ||
        (availableStock !== null &&
          (!Number.isSafeInteger(availableStock) || availableStock < 0))
      ) {
        alert("Fiyat veya stok bilgileri doğrulanamadı. Ödeme başlatılmadı.");
        return;
      }

      const priceChanged =
        Math.abs(Number(item.unitPrice) - freshPrice) > 0.000001;

      const termsChanged =
        Number(item.moq ?? 1) !== freshMoq ||
        Number(item.quantityStep ?? 1) !== freshStep;

      if (priceChanged || termsChanged) {
        saveItems(
          items.map((entry) =>
            cartItemKey(entry) === cartItemKey(item)
              ? {
                  ...entry,
                  unitPrice: freshPrice,
                  moq: freshMoq,
                  quantityStep: freshStep,
                }
              : entry
          )
        );

        alert(
          "Ürünün fiyatı veya sipariş koşulları değişmiş. Sepet güncellendi. Lütfen yeni bilgileri kontrol ederek tekrar devam edin."
        );
        return;
      }

      if (
        item.quantity < freshMoq ||
        (item.quantity - freshMoq) % freshStep !== 0
      ) {
        alert("Sipariş miktarı güncel satış koşullarına uygun değil.");
        return;
      }

      if (availableStock !== null && item.quantity > availableStock) {
        alert("Yeterli satılabilir stok bulunmuyor. Ödeme başlatılmadı.");
        return;
      }

      const expectedTotalAmount = calculateExpectedTotalAmount(
        variant?.price ?? detail.basePrice,
        item.quantity
      );

      if (!expectedTotalAmount || expectedTotalAmount === "0.00") {
        alert("Sipariş tutarı güvenle hesaplanamadı. Ödeme başlatılmadı.");
        return;
      }

      const res = await fetch(`${API}/orders/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          ...(item.variantId ? { variantId: item.variantId } : {}),
          quantity: item.quantity,
          expectedTotalAmount,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("cartPage.orderFailed"));
        return;
      }

      const confirmedAmount = Number(data?.order?.totalAmount);

      if (
        !Number.isFinite(confirmedAmount) ||
        Math.abs(confirmedAmount - Number(expectedTotalAmount)) > 0.000001
      ) {
        alert(
          "Siparişin kesin tutarı sepetteki tutarla doğrulanamadı. " +
          "Ödeme başlatılmadı. Lütfen Siparişlerim sayfasından kontrol edin."
        );
        removeItem(item);
        navigate("/buyer/orders");
        return;
      }

      removeItem(item);

      const orderId = data?.order?.id || data?.id;

      if (!orderId) {
        navigate("/buyer/orders");
        return;
      }

      const paymentRes = await fetch(
        `${API}/payments/iyzico/${orderId}/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = await paymentRes.json().catch(() => null);

      if (!paymentRes.ok) {
        alert(paymentData?.message || t("cartPage.paymentStartFailed"));
        navigate("/buyer/orders");
        return;
      }

      if (Capacitor.isNativePlatform()) {
        if (!paymentData?.paymentPageUrl) {
          alert(t("cartPage.paymentStartFailed"));
          navigate("/buyer/orders");
          return;
        }

        await Browser.open({
          url: paymentData.paymentPageUrl,
          presentationStyle: "fullscreen",
        });

        return;
      }

      if (!paymentData?.checkoutFormContent) {
        alert(t("cartPage.paymentStartFailed"));
        navigate("/buyer/orders");
        return;
      }

      const paymentWindow = window.open(
        "",
        "iyzico-payment",
        "width=520,height=760,scrollbars=yes,resizable=yes"
      );

      if (!paymentWindow) {
        alert(t("cartPage.popupBlocked"));
        navigate("/buyer/orders");
        return;
      }

      paymentWindow.document.open();
      paymentWindow.document.write(`
        <!doctype html>
        <html lang="${i18n.language.startsWith("en") ? "en" : "tr"}">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${t("cartPage.paymentTitle")}</title>
          </head>
          <body>
            ${paymentData.checkoutFormContent}
          </body>
        </html>
      `);
      paymentWindow.document.close();

      const popupWatcher = window.setInterval(() => {
        if (paymentWindow.closed) {
          window.clearInterval(popupWatcher);
          navigate("/buyer/orders");
        }
      }, 700);
    } catch (error) {
      console.error("DIRECT ORDER ERROR:", error);
      alert(t("cartPage.orderFailed"));
    } finally {
      setLoadingId("");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>{t("cartPage.title")}</h1>

        {items.length === 0 ? (
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              border: "1px solid #e2e8f0",
            }}
          >
            <p>{t("cartPage.empty")}</p>
            <button
              type="button"
              onClick={() => navigate("/products")}
              style={primaryButton}
            >
              {t("cartPage.continueShopping")}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 16 }}>
              {items.map((item) => (
                <div
                  key={cartItemKey(item)}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>{item.title}</h3>
                  {item.variantId && (
                    <p style={{ color: "#0f766e", fontWeight: 700 }}>
                      Varyant: {item.variantName || item.variantSku || item.variantId}
                    </p>
                  )}

                  <p>
                    {t("cartPage.unitPrice")}:{" "}
                    <strong>
                      {formatUnitPrice(item.unitPrice, locale)} ₺
                    </strong>
                  </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 20,
                        alignItems: "flex-end",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#334155",
                            marginBottom: 8,
                          }}
                        >
                          {t("cartPage.quantity")}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              commitQuantity(
                                item,
                                Math.max(
                                  getMinimumQuantity(item),
                                  item.quantity - getQuantityStep(item)
                                )
                              )
                            }
                            disabled={item.quantity <= getMinimumQuantity(item)}
                            style={{
                              width: 42,
                              height: 42,
                              border: "1px solid #cbd5e1",
                              borderRadius: 10,
                              background: "#ffffff",
                              fontSize: 20,
                              fontWeight: 800,
                              cursor:
                                item.quantity <= getMinimumQuantity(item)
                                  ? "not-allowed"
                                  : "pointer",
                              opacity:
                                item.quantity <= getMinimumQuantity(item)
                                  ? 0.45
                                  : 1,
                            }}
                          >
                            −
                          </button>

                          <input
                            type="number"
                            min={getMinimumQuantity(item)}
                            step={getQuantityStep(item)}
                            inputMode="numeric"
                            value={
                              quantityInputs[cartItemKey(item)] ??
                              String(item.quantity)
                            }
                            onChange={(e) =>
                              handleQuantityInput(item, e.target.value)
                            }
                            onBlur={() => {
                              const raw =
                                quantityInputs[cartItemKey(item)] ??
                                String(item.quantity);

                              commitQuantity(item, Number(raw));
                            }}
                            style={{
                              width: 92,
                              height: 42,
                              boxSizing: "border-box",
                              padding: "8px 10px",
                              textAlign: "center",
                              border: "1px solid #94a3b8",
                              borderRadius: 10,
                              fontSize: 16,
                              fontWeight: 800,
                              color: "#0f172a",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              commitQuantity(
                                item,
                                item.quantity + getQuantityStep(item)
                              )
                            }
                            style={{
                              width: 42,
                              height: 42,
                              border: "1px solid #cbd5e1",
                              borderRadius: 10,
                              background: "#ffffff",
                              fontSize: 20,
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div
                          style={{
                            marginTop: 7,
                            fontSize: 12,
                            color: "#64748b",
                          }}
                        >
                          Minimum sipariş:{" "}
                          <strong>
                            {getMinimumQuantity(item)} {item.unitType}
                          </strong>
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#64748b",
                            marginBottom: 4,
                          }}
                        >
                          {item.quantity} {item.unitType} ×{" "}
                          {formatUnitPrice(item.unitPrice, locale)} ₺
                        </div>

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          {t("cartPage.lineTotal")}:{" "}
                          {formatMoney(
                            calculateExpectedTotalAmount(item.unitPrice, item.quantity),
                            locale
                          )}{" "}
                          ₺
                        </div>

                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 11,
                            color: "#64748b",
                          }}
                        >
                          KDV dahil
                        </div>
                      </div>
                    </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      marginTop: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => checkoutItem(item)}
                      disabled={loadingId === cartItemKey(item)}
                      style={primaryButton}
                    >
                      {loadingId === cartItemKey(item)
                        ? t("cartPage.creatingOrder")
                        : t("cartPage.checkout")}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      style={secondaryButton}
                    >
                      {t("cartPage.remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                border: "1px solid #e2e8f0",
                textAlign: "end",
              }}
            >
              <strong style={{ fontSize: 22 }}>
                {t("cartPage.cartTotal")}: {formatMoney(total, locale)} ₺
              </strong>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  border: 0,
  background: "#0f172a",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButton: React.CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#0f172a",
  padding: "12px 18px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};
