import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header
      className="w-full border-b sticky top-0 z-50"
      style={{
        background: "#0f172a",
        borderColor: "#1e293b",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
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

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLinks />
          <button onClick={logout} style={logoutButton}>
            Çıkış Yap
          </button>
        </nav>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white text-2xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-4"
          style={{ background: "#0f172a" }}
        >
          <NavLinks mobile />

          <button
            onClick={logout}
            style={logoutButton}
            className="w-full"
          >
            Çıkış Yap
          </button>
        </div>
      )}
    </header>
  );
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      <Link to="/" style={linkStyle} className={mobile ? "block" : ""}>
        Ana Sayfa
      </Link>

      <Link
        to="/tekliflerim"
        style={linkStyle}
        className={mobile ? "block" : ""}
      >
        Tekliflerim
      </Link>

      <Link
        to="/buyer/orders"
        style={linkStyle}
        className={mobile ? "block" : ""}
      >
        Siparişlerim
      </Link>

      <Link
        to="/seller/rfqs"
        style={linkStyle}
        className={mobile ? "block" : ""}
      >
        Gelen Talepler
      </Link>

      <Link
        to="/seller/orders"
        style={linkStyle}
        className={mobile ? "block" : ""}
      >
        Seller Siparişleri
      </Link>

      <Link
        to="/wallet"
        style={linkStyle}
        className={mobile ? "block" : ""}
      >
        Cüzdanım
      </Link>
    </>
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
  padding: "10px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
};