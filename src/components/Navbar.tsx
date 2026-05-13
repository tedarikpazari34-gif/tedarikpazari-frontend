import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header
      className="w-full border-b"
      style={{
        background: "#0f172a",
        borderColor: "#1e293b",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold"
          style={{
            color: "white",
            letterSpacing: "-0.5px",
          }}
        >
          TEDARİK PAZARI
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" style={linkStyle}>
            Ana Sayfa
          </Link>

          <Link to="/tekliflerim" style={linkStyle}>
            Tekliflerim
          </Link>

          <Link to="/buyer/orders" style={linkStyle}>
            Siparişlerim
          </Link>

          <Link to="/seller/rfqs" style={linkStyle}>
            Gelen Talepler
          </Link>

          <Link to="/seller/orders" style={linkStyle}>
            Seller Siparişleri
          </Link>
           <Link to="/wallet" style={linkStyle}>
  Cüzdanım
</Link>
          <button onClick={logout} style={logoutButton}>
            Çıkış Yap
          </button>
        </nav>
      </div>
    </header>
  );
}

const linkStyle = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontWeight: 600,
};

const logoutButton = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};