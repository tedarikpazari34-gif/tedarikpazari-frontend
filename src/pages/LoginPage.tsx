import { useState } from "react";
import axios from "axios";

const API = "https://tedarik-backend.onrender.com/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(`${API}/auth/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      const token = res.data?.token;
      const role = res.data?.user?.role || res.data?.role;
      console.log("LOGIN RESPONSE:", res.data);
      console.log("ROLE:", role);

      if (!token) {
        setError("Token gelmedi");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "");

      if (role === "LOGISTICS") {
        window.location.href = "/logistics/shipping";
      } else if (role === "SELLER") {
        window.location.href = "/seller/orders";
      } else if (role === "ADMIN") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/buyer/shipping";
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Giriş başarısız"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Giriş Yap</h1>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <button onClick={login} disabled={loading}>
        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </div>
  );
}