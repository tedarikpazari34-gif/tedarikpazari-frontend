import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= 768
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <footer
      style={{
        ...footerStyle,
        padding: isMobile ? "28px 18px 120px" : "56px 24px 22px",
      }}
    >
      <div
        style={{
          ...mainStyle,
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(180px, 1fr))",
          gap: isMobile ? 24 : 38,
        }}
      >
        <div
          style={{
            ...brandColumnStyle,
            gridColumn: isMobile ? "1 / -1" : undefined,
          }}
        >
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
            ["Teslimat ve İade Şartları", "/teslimat-ve-iade"],
            ["Mesafeli Satış Sözleşmesi", "/mesafeli-satis-sozlesmesi"],
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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 16,
            }}
          >
            <strong style={columnTitleStyle}>Bizi Takip Edin</strong>

            <a
              href="https://www.instagram.com/tedarikpazari/"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              📸 Instagram
            </a>

            <a
              href="https://www.facebook.com/share/1E3oSxUxDg/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              Facebook
            </a>

            <a
              href="https://www.linkedin.com/in/tedarik-pazarı-b54996427"
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          margin: isMobile ? "28px auto 0" : "38px auto 0",
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "center" : "flex-start",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        <strong style={{ color: "#ffffff", fontSize: 14 }}>
          Güvenli Ödeme
        </strong>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              background: "#ffffff",
              borderRadius: 8,
              padding: "7px 10px",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            <img
              src="/images/payments/visa.png"
              alt="Visa"
              style={{ width: 62, height: "auto", display: "block" }}
            />
          </span>

          <img
            src="/images/payments/mastercard.png"
            alt="Mastercard"
            style={{ width: 58, height: "auto", display: "block" }}
          />

          <img
            src="/images/payments/iyzico-ile-ode.svg"
            alt="iyzico ile Öde"
            style={{ width: 360, height: "auto", display: "block" }}
          />
        </div>
      </div>

      <div
        style={{
          ...bottomStyle,
          margin: isMobile ? "28px auto 0" : "42px auto 0",
          paddingTop: isMobile ? 16 : 20,
          fontSize: isMobile ? 12 : 13,
        }}
      >
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
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
  boxSizing: "border-box",
  padding: "56px 24px 22px",
  color: "#e2e8f0",
  background:
    "linear-gradient(135deg, #020617 0%, #0f172a 55%, #172554 100%)",
};

const mainStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  minWidth: 0,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 38,
};

const brandColumnStyle: CSSProperties = {
  minWidth: 0,
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
  minWidth: 0,
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
  minWidth: 0,
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: 14,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const smallTextStyle: CSSProperties = {
  marginTop: 4,
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.6,
};

const bottomStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  minWidth: 0,
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
