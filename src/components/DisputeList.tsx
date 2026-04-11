import React from "react";

interface DisputeItem {
  id: string;
  orderId: string;
  reason: string;
  description?: string;
  status: string;
}

interface Props {
  disputes: DisputeItem[];
  panelCardStyle: React.CSSProperties;
}

export default function DisputeList({
  disputes,
  panelCardStyle,
}: Props) {
  return (
    <>
      <h2>Disputes</h2>

      {disputes.map((d) => (
        <div key={d.id} style={panelCardStyle}>
          <div>Order: {d.orderId}</div>
          <div>Sebep: {d.reason}</div>
          <div>Durum: {d.status}</div>
        </div>
      ))}
    </>
  );
}