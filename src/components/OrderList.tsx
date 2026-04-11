import React from "react";

interface OrderItem {
  id: string;
  status: string;
  totalAmount: string;
  commissionAmount: string;
  escrowAmount: string;
  quoteId?: string;
  rfq?: {
    quantity?: number;
    product?: {
      title?: string;
    };
  };
  quote?: {
    id?: string;
    unitPrice?: number | string;
    deliveryDays?: number;
  };
}

interface Props {
  orders: OrderItem[];
  role: string;
  payOrder: (id: string) => void;
  prepareOrder: (id: string) => void;
  shipOrder: (id: string) => void;
  completeOrder: (id: string) => void;
  openDispute: (id: string) => void;
  statusBadgeStyle: (status: string) => React.CSSProperties;
  panelCardStyle: React.CSSProperties;
}

export default function OrderList({
  orders,
  role,
  payOrder,
  prepareOrder,
  shipOrder,
  completeOrder,
  openDispute,
  statusBadgeStyle,
  panelCardStyle,
}: Props) {
  return (
    <>
      <h2>Orders</h2>

      {orders.map((o) => (
        <div key={o.id} style={panelCardStyle}>
          <div>Ürün: {o.rfq?.product?.title || "-"}</div>
          <div>Miktar: {o.rfq?.quantity || "-"}</div>
          <div>Quote ID: {o.quote?.id || o.quoteId || "-"}</div>
          <div>Birim Fiyat: {o.quote?.unitPrice || "-"}</div>
          <div>Teslim Süresi: {o.quote?.deliveryDays || "-"} gün</div>
          <div>Toplam: {o.totalAmount}</div>
          <div>Komisyon: {o.commissionAmount}</div>
          <div>Escrow: {o.escrowAmount}</div>

          <div style={{ marginTop: 8 }}>
            Durum:{" "}
            <span style={statusBadgeStyle(o.status)}>{o.status}</span>
          </div>

          {role === "BUYER" && o.status === "PENDING_PAYMENT" && (
            <button style={{ marginTop: 10 }} onClick={() => payOrder(o.id)}>
              Ödeme Yap
            </button>
          )}

          {role === "SELLER" && o.status === "PAID" && (
            <button style={{ marginTop: 10 }} onClick={() => prepareOrder(o.id)}>
              Hazırlığa Al
            </button>
          )}

          {role === "SELLER" && o.status === "PREPARING" && (
            <button style={{ marginTop: 10 }} onClick={() => shipOrder(o.id)}>
              Kargoya Ver
            </button>
          )}

          {role === "BUYER" && o.status === "SHIPPED" && (
            <div style={{ marginTop: 10 }}>
              <button
                style={{ marginRight: 8 }}
                onClick={() => completeOrder(o.id)}
              >
                Teslim Aldım
              </button>
              <button onClick={() => openDispute(o.id)}>Dispute Aç</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}