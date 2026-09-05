import type { CSSProperties, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type PageContent = {
  title: string;
  description: string;
  content: ReactNode;
};

const buildPages = (t: (key: string) => string): Record<string, PageContent> => ({
  "/hakkimizda": {
    title: t("corporatePage.about.title"),
    description: t("corporatePage.about.description"),
    content: (
      <>
        <h2>{t("corporatePage.about.processTitle")}</h2>
        <p>
          {t("corporatePage.about.processText")}
        </p>

        <h2>{t("corporatePage.about.howTitle")}</h2>
        <p>
          {t("corporatePage.about.howText")}
        </p>

        <h2>{t("corporatePage.about.safeTitle")}</h2>
        <p>
          {t("corporatePage.about.safeText")}
        </p>

        <h2>{t("corporatePage.about.visionTitle")}</h2>
        <p>
          {t("corporatePage.about.visionText")}
        </p>
      </>
    ),
  },

  "/iletisim": {
    title: t("corporatePage.contact.title"),
    description: t("corporatePage.contact.description"),
    content: (
      <>
        <h2>{t("corporatePage.contact.contactTitle")}</h2>
        <p>
          {t("corporatePage.contact.contactText")}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            margin: "24px 0",
            padding: 22,
            borderRadius: 16,
            background: "#eff6ff",
          }}
        >
          <strong>{t("corporatePage.contact.email")}</strong>
          <a
            href="mailto:tedarikpazari34@gmail.com"
            style={{
              color: "#2563eb",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            tedarikpazari34@gmail.com
          </a>
        </div>

        <h2>{t("corporatePage.contact.socialTitle")}</h2>
        <p>
          {t("corporatePage.contact.socialText")}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            margin: "20px 0 28px",
          }}
        >
          <a
            href="https://www.instagram.com/tedarikpazari/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              padding: 16,
              borderRadius: 14,
              background: "#fff7ed",
              color: "#9a3412",
              fontWeight: 800,
              border: "1px solid #fed7aa",
            }}
          >
            📸 Instagram
          </a>

          <a
            href="https://www.facebook.com/share/1E3oSxUxDg/?mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              padding: 16,
              borderRadius: 14,
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 800,
              border: "1px solid #bfdbfe",
            }}
          >
            Facebook
          </a>

          <a
            href="https://www.linkedin.com/in/tedarik-pazarı-b54996427"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              padding: 16,
              borderRadius: 14,
              background: "#f0f9ff",
              color: "#0369a1",
              fontWeight: 800,
              border: "1px solid #bae6fd",
            }}
          >
            LinkedIn
          </a>
        </div>

        <h2>{t("corporatePage.contact.supportTitle")}</h2>
        <p>
          {t("corporatePage.contact.supportText")}
        </p>

        <h2>{t("corporatePage.contact.legalTitle")}</h2>
        <div style={{ margin: "20px 0 28px", padding: 22, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <p><strong>{t("corporatePage.contact.businessBrand")}</strong> Tedarik Pazarı</p>
          <p><strong>{t("corporatePage.contact.email")}:</strong> tedarikpazari34@gmail.com</p>
        </div>

        <h2>{t("corporatePage.contact.securityTitle")}</h2>
        <p>
          {t("corporatePage.contact.securityText")}
        </p>
      </>
    ),
  },

  "/yardim": {
    title: t("corporatePage.help.title"),
    description: t("corporatePage.help.description"),
    content: (
      <>
        <h2>{t("corporatePage.help.membershipTitle")}</h2>
        <p>
          {t("corporatePage.help.membershipText")}
        </p>

        <h2>{t("corporatePage.help.quoteTitle")}</h2>
        <p>
          {t("corporatePage.help.quoteText")}
        </p>

        <h2>{t("corporatePage.help.sellerQuoteTitle")}</h2>
        <p>
          {t("corporatePage.help.sellerQuoteText")}
        </p>

        <h2>{t("corporatePage.help.paymentTitle")}</h2>
        <p>
          {t("corporatePage.help.paymentText")}
        </p>

        <h2>{t("corporatePage.help.payoutTitle")}</h2>
        <p>
          {t("corporatePage.help.payoutText")}
        </p>

        <h2>{t("corporatePage.help.disputeTitle")}</h2>
        <p>
          {t("corporatePage.help.disputeText")}
        </p>
      </>
    ),
  },
});

export default function CorporatePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const pages = buildPages(t);
  const page = pages[location.pathname] || pages["/hakkimizda"];

  return (
    <main style={pageStyle}>
      <Helmet>
        <title>{page.title} | Tedarik Pazarı</title>
        <meta name="description" content={page.description} />
        <link
          rel="canonical"
          href={`https://xn--tedarikpazar-d5b.com${location.pathname}`}
        />
      </Helmet>

      <article style={cardStyle}>
        <Link to="/" style={backStyle}>
          {t("corporatePage.backHome")}
        </Link>

        <div style={eyebrowStyle}>{t("corporatePage.brand")}</div>
        <h1 style={titleStyle}>{page.title}</h1>

        <div style={contentStyle}>{page.content}</div>
      </article>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  padding: "48px 20px",
  background: "#f8fafc",
};

const cardStyle: CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "40px",
  borderRadius: 24,
  background: "#ffffff",
  boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
};

const backStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 28,
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 700,
};

const eyebrowStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 1.2,
};

const titleStyle: CSSProperties = {
  margin: "8px 0 0",
  color: "#0f172a",
  fontSize: "clamp(34px, 5vw, 52px)",
};

const contentStyle: CSSProperties = {
  marginTop: 36,
  color: "#334155",
  fontSize: 16,
  lineHeight: 1.8,
};

