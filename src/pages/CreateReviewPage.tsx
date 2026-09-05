import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";
export default function CreateReviewPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

const [orderId, setOrderId] = useState(
  searchParams.get("orderId") || ""
);
const [rating, setRating] = useState(5);
const [comment, setComment] = useState("");

  const submit = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("API:", API);
console.log("TOKEN:", localStorage.getItem("token"));
console.log("ORDER ID:", orderId);
      const res = await fetch(`${API}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || t("createReviewPage.submitFailed"));
        return;
      }

      alert(t("createReviewPage.submitSuccess"));
    } catch (err) {
  console.error("REVIEW ERROR:", err);
  alert(String(err));
}
  };

  return (
    <main style={page}>
      <div style={card}>
        <h1 style={title}>{t("createReviewPage.title")}</h1>

        <input
          placeholder={t("createReviewPage.orderId")}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={input}
        />

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={input}
        >
          <option value={5}>5 ⭐</option>
          <option value={4}>4 ⭐</option>
          <option value={3}>3 ⭐</option>
          <option value={2}>2 ⭐</option>
          <option value={1}>1 ⭐</option>
        </select>

        <textarea
          placeholder={t("createReviewPage.commentPlaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={textarea}
        />

        <button onClick={submit} style={button}>
          {t("createReviewPage.submit")}
        </button>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#020617",
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  background: "#0f172a",
  padding: 24,
  borderRadius: 18,
};

const title: React.CSSProperties = {
  color: "white",
  marginBottom: 20,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  padding: 12,
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
};

const button: React.CSSProperties = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};