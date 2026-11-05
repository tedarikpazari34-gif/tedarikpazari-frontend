export type InvoiceKind = "SALE" | "RETURN" | "CREDIT_NOTE";
export type InvoiceStatus =
  | "PENDING_REVIEW"
  | "RECORDED"
  | "REJECTED"
  | "CANCELLED";

export type InvoiceRecord = {
  id: string;
  orderId: string;
  kind: InvoiceKind;
  status: InvoiceStatus;
  invoiceNumber?: string | null;
  issuedAt?: string | null;
  totalAmount: string | number;
  currency: string;
  reviewNote?: string | null;
  createdAt: string;
  buyerId?: string;
  sellerId?: string;
  issuerCompanyId?: string;
};

const API =
  import.meta.env.VITE_INVOICE_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

function requireInvoiceWritePermission(): void {
  if (import.meta.env.VITE_ENABLE_INVOICE_WRITE !== "true") {
    throw new Error(
      "Fatura yükleme ve onay işlemleri güvenlik nedeniyle henüz etkin değil.",
    );
  }

  const apiUrl = new URL(API);
  const isLiveBackend =
    apiUrl.hostname === "tedarik-backend.onrender.com" ||
    apiUrl.hostname === "tedarikpazarı.com" ||
    apiUrl.hostname === "xn--tedarikpazar-d5b.com";

  if (isLiveBackend && import.meta.env.VITE_ALLOW_LIVE_INVOICE_WRITE !== "true") {
    throw new Error(
      "Canlı backend üzerinde fatura yazma işlemleri ayrıca yetkilendirilmelidir.",
    );
  }
}

function requireToken(): string {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Oturum açmanız gerekiyor");
  return token;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API}/invoices/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${requireToken()}`,
      ...init.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message;
    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : typeof message === "string"
          ? message
          : `Fatura işlemi başarısız (${response.status})`,
    );
  }

  return data as T;
}

export const invoiceApi = {
  mine: () => request<InvoiceRecord[]>("mine"),

  admin: () => request<InvoiceRecord[]>("admin"),

  download: (id: string) =>
    request<{ invoiceId: string; url: string; expiresAt: string }>(
      `${encodeURIComponent(id)}/download`,
    ),

  uploadSale: (
    orderId: string,
    file: File,
    invoiceNumber: string,
    channel: "E_INVOICE" | "E_ARCHIVE" | "PAPER",
    issuedAt: string,
  ) => {
    requireInvoiceWritePermission();
    const form = new FormData();
    form.append("file", file);
    form.append("invoiceNumber", invoiceNumber);
    form.append("channel", channel);
    form.append("issuedAt", issuedAt);

    return request<InvoiceRecord>(
      `orders/${encodeURIComponent(orderId)}`,
      { method: "POST", body: form },
    );
  },

  uploadReturn: (
    orderId: string,
    file: File,
    kind: "RETURN" | "CREDIT_NOTE",
    disputeId: string,
    originalSaleInvoiceId: string,
    invoiceNumber: string,
    channel: "E_INVOICE" | "E_ARCHIVE" | "PAPER",
    issuedAt: string,
  ) => {
    requireInvoiceWritePermission();
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    form.append("disputeId", disputeId);
    form.append("originalSaleInvoiceId", originalSaleInvoiceId);
    form.append("invoiceNumber", invoiceNumber);
    form.append("channel", channel);
    form.append("issuedAt", issuedAt);

    return request<InvoiceRecord>(
      `returns/${encodeURIComponent(orderId)}`,
      { method: "POST", body: form },
    );
  },

  review: (
    id: string,
    action: "APPROVE" | "REJECT",
    reason?: string,
  ) => {
    requireInvoiceWritePermission();
    return request<InvoiceRecord>(
      `admin/${encodeURIComponent(id)}/review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      },
    );
  },
};
