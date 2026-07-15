import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={innerStyle}>
        <div>
          <strong style={brandStyle}>Tedarik Pazarı</strong>
          <p style={textStyle}>B2B teklif, tedarik ve sipariş platformu.</p>
        </div>

        <nav style={linksStyle}>
          <Link to="/aydinlatma-metni" style={linkStyle}>Aydınlatma Metni</Link>
          <Link to="/kvkk" style={linkStyle}>KVKK Politikası</Link>
          <Link to="/gizlilik-politikasi" style={linkStyle}>Gizlilik</Link>
          <Link to="/kullanim-kosullari" style={linkStyle}>Kullanım Koşulları</Link>
          <Link to="/cerez-politikasi" style={linkStyle}>Çerez Politikası</Link>
        </nav>
      </div>
    </footer>
  );
}

const footerStyle: CSSProperties = {
  background: "#0f172a",
  color: "#e2e8f0",
  padding: "36px 20px",
};

const innerStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  flexWrap: "wrap",
  gap: 24,
};

const brandStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 20,
};

const textStyle: CSSProperties = {
  marginBottom: 0,
  color: "#94a3b8",
};

const linksStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 18,
};

const linkStyle: CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: 14,
};
