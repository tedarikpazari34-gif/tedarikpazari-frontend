import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const API = import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

type Order = {
  id: string;
  status: string;
  totalAmount?: number | string | null;
  createdAt?: string | null;
};

const translations = {
  tr: ["Sipariş ve Ödeme Dökümü", "Ödemesi tamamlanmış durumdaki siparişler", "Ödeme bekleyen siparişler", "Sipariş", "Tarih", "Durum", "Tutar", "Yenile", "Yükleniyor...", "Sipariş bulunamadı.", "Kayıtlar yüklenemedi.", "Bu bölüm sipariş kayıtlarının özetidir. Resmi fatura, banka hesap hareketi veya muhasebe cari ekstresi değildir.", "Son 12 sipariş gösteriliyor.", "Tekrar giriş yapın."],
  en: ["Orders and Payment Overview", "Orders with completed payment status", "Orders awaiting payment", "Order", "Date", "Status", "Amount", "Refresh", "Loading...", "No orders found.", "Could not load records.", "This is an order summary, not an official invoice, bank statement or accounting ledger.", "Showing the latest 12 orders.", "Please sign in again."],
  de: ["Bestell- und Zahlungsübersicht", "Bestellungen mit abgeschlossenem Zahlungsstatus", "Bestellungen mit ausstehender Zahlung", "Bestellung", "Datum", "Status", "Betrag", "Aktualisieren", "Laden...", "Keine Bestellungen vorhanden.", "Daten konnten nicht geladen werden.", "Dies ist eine Bestellübersicht, keine Rechnung, kein Kontoauszug und keine Buchhaltungsübersicht.", "Die letzten 12 Bestellungen werden angezeigt.", "Bitte erneut anmelden."],
  ru: ["Обзор заказов и платежей", "Заказы со статусом оплачено", "Заказы в ожидании оплаты", "Заказ", "Дата", "Статус", "Сумма", "Обновить", "Загрузка...", "Заказы не найдены.", "Не удалось загрузить данные.", "Это сводка заказов, а не официальный счёт, банковская выписка или бухгалтерский реестр.", "Показаны последние 12 заказов.", "Войдите снова."],
  ka: ["შეკვეთებისა და გადახდების მიმოხილვა", "გადახდილი სტატუსის მქონე შეკვეთები", "გადახდის მომლოდინე შეკვეთები", "შეკვეთა", "თარიღი", "სტატუსი", "თანხა", "განახლება", "იტვირთება...", "შეკვეთები ვერ მოიძებნა.", "ჩანაწერები ვერ ჩაიტვირთა.", "ეს მხოლოდ შეკვეთების შეჯამებაა და არა ოფიციალური ინვოისი ან საბუღალტრო ამონაწერი.", "ნაჩვენებია ბოლო 12 შეკვეთა.", "ხელახლა შედით."],
  ar: ["ملخص الطلبات والمدفوعات", "الطلبات بحالة دفع مكتمل", "الطلبات بانتظار الدفع", "الطلب", "التاريخ", "الحالة", "المبلغ", "تحديث", "جارٍ التحميل...", "لا توجد طلبات.", "تعذر تحميل السجلات.", "هذا ملخص للطلبات وليس فاتورة رسمية أو كشف حساب بنكي أو سجلًا محاسبيًا.", "يتم عرض آخر 12 طلبًا.", "يرجى تسجيل الدخول مجددًا."],
  uz: ["Buyurtmalar va to‘lovlar hisoboti", "To‘lovi yakunlangan holatdagi buyurtmalar", "To‘lov kutilayotgan buyurtmalar", "Buyurtma", "Sana", "Holat", "Summa", "Yangilash", "Yuklanmoqda...", "Buyurtmalar topilmadi.", "Ma’lumotlar yuklanmadi.", "Bu buyurtmalar xulosasi, rasmiy hisob-faktura, bank ko‘chirmasi yoki buxgalteriya qaydnomasi emas.", "Oxirgi 12 ta buyurtma ko‘rsatilmoqda.", "Qayta kiring."]
};

const paidStatuses = new Set([
  "PAID", "PREPARING", "SHIPPED", "COMPLETED"
]);

function amount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export default function BuyerOrderFinancialSummary() {
  const { i18n } = useTranslation();
  const lang = i18n.language.split("-")[0].toLowerCase();
  const t = translations[lang as keyof typeof translations] || translations.tr;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error(t[13]);

        const response = await fetch(`${API}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store"
        });

        if (!response.ok) throw new Error(t[10]);

        const payload: unknown = await response.json();

        const list: unknown = Array.isArray(payload)
          ? payload
          : payload && typeof payload === "object"
            ? (payload as { orders?: unknown; data?: unknown }).orders ??
              (payload as { data?: unknown }).data
            : null;

        if (!Array.isArray(list)) throw new Error(t[10]);

        const valid = list.filter(
          (item: unknown): item is Order =>
            item !== null &&
            typeof item === "object" &&
            typeof (item as Order).id === "string" &&
            typeof (item as Order).status === "string"
        );

        if (!controller.signal.aborted) {
          setOrders(valid);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : t[10]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [refresh, lang]);

  const paid = orders.filter(o => paidStatuses.has(o.status));
  const pending = orders.filter(o => o.status === "PENDING_PAYMENT");

  const paidTotal = paid.reduce(
    (sum, order) => sum + amount(order.totalAmount), 0
  );
  const pendingTotal = pending.reduce(
    (sum, order) => sum + amount(order.totalAmount), 0
  );

  function money(value: number) {
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: "TRY"
    }).format(value);
  }

  const latest = [...orders].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  ).slice(0, 12);

  return (
    <section style={{
      padding: 20,
      marginBottom: 24,
      border: "1px solid #99f6e4",
      borderRadius: 14,
      background: "#fff"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <h2 style={{ color: "#0f766e", margin: 0, fontSize: 20 }}>
          {t[0]}
        </h2>
        <button type="button"
          disabled={loading}
          onClick={() => setRefresh(v => v + 1)}
          style={{
            border: 0,
            background: "#0d9488",
            color: "#fff",
            padding: "9px 14px",
            borderRadius: 8,
            cursor: loading ? "wait" : "pointer"
          }}>
          {t[7]}
        </button>
      </div>

      {loading && <p role="status">{t[8]}</p>}

      {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginTop: 18
          }}>
            <div style={{
              padding: 14,
              borderRadius: 10,
              background: "#f0fdfa"
            }}>
              <strong>{t[1]}</strong>
              <p style={{ fontSize: 20, fontWeight: 700 }}>
                {money(paidTotal)}
              </p>
              <small>{paid.length} {t[3].toLowerCase()}</small>
            </div>
            <div style={{
              padding: 14,
              borderRadius: 10,
              background: "#fff7ed"
            }}>
              <strong>{t[2]}</strong>
              <p style={{ fontSize: 20, fontWeight: 700 }}>
                {money(pendingTotal)}
              </p>
              <small>{pending.length} {t[3].toLowerCase()}</small>
            </div>
          </div>

          {latest.length === 0 && <p>{t[9]}</p>}

          {latest.length > 0 && (
            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left"
              }}>
                <thead>
                  <tr>
                    {[t[3], t[4], t[5], t[6]].map(label => (
                      <th key={label} style={{
                        padding: 10,
                        borderBottom: "1px solid #cbd5e1"
                      }}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {latest.map(order => (
                    <tr key={order.id}>
                      <td style={{ padding: 10 }}>
                        <code title={order.id}>{order.id.slice(0, 8)}</code>
                      </td>
                      <td style={{ padding: 10 }}>
                        {order.createdAt &&
                          !Number.isNaN(Date.parse(order.createdAt))
                          ? new Date(order.createdAt).toLocaleDateString(i18n.language)
                          : "—"}
                      </td>
                      <td style={{ padding: 10 }}>{order.status}</td>
                      <td style={{ padding: 10 }}>
                        {money(amount(order.totalAmount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <small>{t[12]}</small>
            </div>
          )}

          <p style={{
            fontSize: 13,
            color: "#475569",
            marginTop: 16
          }}>
            {t[11]}
          </p>
        </>
      )}
    </section>
  );
}
