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
  const [loadingId, setLoadingId] = useState("");

  const loadCart = () => {
    try {
      const raw = localStorage.getItem("tedarikCart");
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;

    saveItems(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const checkoutItem = async (item: CartItem) => {
    if (loadingId) return;

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
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <label>
                      {t("cartPage.quantity")}{" "}
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.productId,
                            Math.max(1, Number(e.target.value || 1))
                          )
                        }
                        style={{
                          width: 110,
                          padding: "10px 12px",
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                        }}
                      />
                    </label>

                    <strong>
                      {t("cartPage.lineTotal")}:{" "}
                      {Number(item.unitPrice * item.quantity).toLocaleString(
                        locale
                      )}{" "}
                      ₺
                    </strong>
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
                textAlign: "right",
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
