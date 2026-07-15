import type { CSSProperties } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={footerStyle}>
      <div style={mainStyle}>
        <div style={brandColumnStyle}>
          <div style={logoStyle}>TP</div>

          <div>
            <strong style={brandStyle}>Tedarik Pazarı</strong>
            <p style={textStyle}>
              İşletmeleri güvenilir tedarikçilerle buluşturan B2B teklif,
              sipariş ve güvenli ödeme platformu.
            </p>
          </div>
        </div>

        <FooterColumn
          title="Kurumsal"
          links={[
            ["Hakkımızda", "/hakkimizda"],
            ["İletişim", "/iletisim"],
            ["Yardım Merkezi", "/yardim"],
          ]}
        />

        <FooterColumn
          title="Yasal"
          links={[
            ["Aydınlatma Metni", "/aydinlatma-metni"],
            ["KVKK Politikası", "/kvkk"],
            ["Gizlilik Politikası", "/gizlilik-politikasi"],
            ["Kullanım Koşulları", "/kullanim-kosullari"],
            ["Çerez Politikası", "/cerez-politikasi"],
          ]}
        />

        <div style={columnStyle}>
          <strong style={columnTitleStyle}>Destek</strong>

          <a
            href="mailto:tedarikpazari34@gmail.com"
            style={linkStyle}
          >
            tedarikpazari34@gmail.com
          </a>

          <span style={smallTextStyle}>
            Hesap bilgilerinizi ve kart şifrenizi kimseyle paylaşmayın.
          </span>
        </div>
      </div>

      <div style={bottomStyle}>
        <span>©️ 2026 Tedarik Pazarı. Tüm hakları saklıdır.</span>
        <span>Güvenli B2B ticaret altyapısı</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div style={columnStyle}>
      <strong style={columnTitleStyle}>{title}</strong>

      {links.map(([label, to]) => (
        <Link key={to} to={to} style={linkStyle}>
          {label}
        </Link>
      ))}
    </div>
  );
}

const footerStyle: CSSProperties = {
  padding: "56px 24px 22px",
  color: "#e2e8f0",
  background:
    "linear-gradient(135deg, #020617 0%, #0f172a 55%, #172554 100%)",
};

const mainStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(240px, 2fr) repeat(3, minmax(150px, 1fr))",
  gap: 38,
};

const brandColumnStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 14,
};

const logoStyle: CSSProperties = {
  minWidth: 48,
  height: 48,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  color: "#ffffff",
  fontWeight: 900,
  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
  boxShadow: "0 10px 24px rgba(37,99,235,0.32)",
};

const brandStyle: CSSProperties = {
  color: "#ffffff",
  fontSize: 21,
};

const textStyle: CSSProperties = {
  maxWidth: 360,
  margin: "10px 0 0",
  color: "#94a3b8",
  lineHeight: 1.7,
};

const columnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const columnTitleStyle: CSSProperties = {
  marginBottom: 4,
  color: "#ffffff",
  fontSize: 15,
};

const linkStyle: CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: 14,
};

const smallTextStyle: CSSProperties = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.6,
};

const bottomStyle: CSSProperties = {
  maxWidth: 1180,
  margin: "42px auto 0",
  paddingTop: 20,
  borderTop: "1px solid rgba(148,163,184,0.2)",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: 12,
  color: "#64748b",
  fontSize: 13,
};
