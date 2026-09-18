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
  title: string;
  quantity: number;
  moq?: number;
  unitType: string;
  unitPrice: number;
  sellerId?: string | null;
  imageUrl?: string | null;
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
          cartItems.map((item) => [item.productId, String(item.quantity)])
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

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
        0
      ),
    [items]
  );

  const saveItems = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("tedarikCart", JSON.stringify(next));
    window.dispatchEvent(new Event("tedarik-cart-changed"));
  };

  const removeItem = (productId: string) => {
    saveItems(items.filter((item) => item.productId !== productId));
  };

  const getMinimumQuantity = (item: CartItem) =>
    Math.max(Number(item.moq || 1), 1);

  const commitQuantity = (item: CartItem, requestedQuantity: number) => {
    const minimum = getMinimumQuantity(item);

    const normalized =
      Number.isInteger(requestedQuantity) && requestedQuantity >= minimum
        ? requestedQuantity
        : minimum;

    setQuantityInputs((current) => ({
      ...current,
      [item.productId]: String(normalized),
    }));

    saveItems(
      items.map((currentItem) =>
        currentItem.productId === item.productId
          ? { ...currentItem, quantity: normalized }
          : currentItem
      )
    );
  };

  const handleQuantityInput = (item: CartItem, value: string) => {
    setQuantityInputs((current) => ({
      ...current,
      [item.productId]: value,
    }));

    if (value === "") return;

    const next = Number(value);

    if (Number.isInteger(next) && next > 0) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.productId === item.productId
            ? { ...currentItem, quantity: next }
            : currentItem
        )
      );
    }
  };

  const checkoutItem = async (item: CartItem) => {
    if (loadingId) return;

    const minimum = getMinimumQuantity(item);

    if (!Number.isInteger(item.quantity) || item.quantity < minimum) {
      commitQuantity(item, minimum);
      alert(
        `Bu ürün için minimum sipariş miktarı ${minimum} ${item.unitType}.`
      );
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
      setLoadingId(item.productId);

      const res = await fetch(`${API}/orders/direct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || t("cartPage.orderFailed"));
        return;
      }

      removeItem(item.productId);

      const orderId = data?.id;

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
                  key={item.productId}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: 20,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>{item.title}</h3>

                  <p>
                    {t("cartPage.unitPrice")}:{" "}
                    <strong>
                      {Number(item.unitPrice).toLocaleString(locale)} ₺
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
                                  item.quantity - 1
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
                            step={1}
                            inputMode="numeric"
                            value={
                              quantityInputs[item.productId] ??
                              String(item.quantity)
                            }
                            onChange={(e) =>
                              handleQuantityInput(item, e.target.value)
                            }
                            onBlur={() => {
                              const raw =
                                quantityInputs[item.productId] ??
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
                              commitQuantity(item, item.quantity + 1)
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
                          {Number(item.unitPrice).toLocaleString(locale)} ₺
                        </div>

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 900,
                            color: "#0f172a",
                          }}
                        >
                          {t("cartPage.lineTotal")}:{" "}
                          {Number(
                            item.unitPrice * item.quantity
                          ).toLocaleString(locale)}{" "}
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
                      disabled={loadingId === item.productId}
                      style={primaryButton}
                    >
                      {loadingId === item.productId
                        ? t("cartPage.creatingOrder")
                        : t("cartPage.checkout")}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
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
                {t("cartPage.cartTotal")}: {total.toLocaleString(locale)} ₺
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
