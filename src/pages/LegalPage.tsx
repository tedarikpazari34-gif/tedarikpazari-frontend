import type { CSSProperties, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

type LegalContent = {
  title: string;
  description: string;
  updatedAt: string;
  content: ReactNode;
};

const contactEmail = "tedarikpazari34@gmail.com";

type TFunction = (
  key: string,
  options?: Record<string, string>
) => string;

const buildPages = (t: TFunction): Record<string, LegalContent> => ({
  "/kvkk": {
    title: t("legalPage.kvkk.title"),
    description: t("legalPage.kvkk.description"),
    updatedAt: t("legalPage.kvkk.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.kvkk.h1")}</h2>
        <p>{t("legalPage.kvkk.p1")}</p>

        <h2>{t("legalPage.kvkk.h2")}</h2>
        <p>{t("legalPage.kvkk.p2")}</p>

        <h2>{t("legalPage.kvkk.h3")}</h2>
        <p>{t("legalPage.kvkk.p3")}</p>

        <h2>{t("legalPage.kvkk.h4")}</h2>
        <p>{t("legalPage.kvkk.p4")}</p>

        <h2>{t("legalPage.kvkk.h5")}</h2>
        <p>{t("legalPage.kvkk.p5", { email: contactEmail })}</p>
      </>
    ),
  },

  "/aydinlatma-metni": {
    title: t("legalPage.disclosure.title"),
    description: t("legalPage.disclosure.description"),
    updatedAt: t("legalPage.disclosure.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.disclosure.h1")}</h2>
        <p>{t("legalPage.disclosure.p1")}</p>

        <h2>{t("legalPage.disclosure.h2")}</h2>
        <p>{t("legalPage.disclosure.p2")}</p>

        <h2>{t("legalPage.disclosure.h3")}</h2>
        <p>{t("legalPage.disclosure.p3")}</p>

        <h2>{t("legalPage.disclosure.h4")}</h2>
        <p>{t("legalPage.disclosure.p4")}</p>

        <h2>{t("legalPage.disclosure.h5")}</h2>
        <p>{t("legalPage.disclosure.p5", { email: contactEmail })}</p>
      </>
    ),
  },

  "/gizlilik-politikasi": {
    title: t("legalPage.privacy.title"),
    description: t("legalPage.privacy.description"),
    updatedAt: t("legalPage.privacy.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.privacy.h1")}</h2>
        <p>{t("legalPage.privacy.p1")}</p>

        <h2>{t("legalPage.privacy.h2")}</h2>
        <p>{t("legalPage.privacy.p2")}</p>

        <h2>{t("legalPage.privacy.h3")}</h2>
        <p>{t("legalPage.privacy.p3")}</p>

        <h2>{t("legalPage.privacy.h4")}</h2>
        <p>{t("legalPage.privacy.p4")}</p>

        <h2>{t("legalPage.privacy.h5")}</h2>
        <p>{t("legalPage.privacy.p5")}</p>

        <h2>{t("legalPage.privacy.h6")}</h2>
        <p>{t("legalPage.privacy.p6")}</p>

        <h2>{t("legalPage.privacy.h7")}</h2>
        <p>{t("legalPage.privacy.p7")}</p>

        <h2>{t("legalPage.privacy.h8")}</h2>
        <p>{t("legalPage.privacy.p8")}</p>

        <h2>{t("legalPage.privacy.h9")}</h2>
        <p>{t("legalPage.privacy.p9")}</p>

        <h2>{t("legalPage.privacy.h10")}</h2>
        <p>{t("legalPage.privacy.p10", { email: contactEmail })}</p>
      </>
    ),
  },

  "/kullanim-kosullari": {
    title: t("legalPage.terms.title"),
    description: t("legalPage.terms.description"),
    updatedAt: t("legalPage.terms.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.terms.h1")}</h2>
        <p>{t("legalPage.terms.p1")}</p>

        <h2>{t("legalPage.terms.h2")}</h2>
        <p>{t("legalPage.terms.p2")}</p>

        <h2>{t("legalPage.terms.h3")}</h2>
        <p>{t("legalPage.terms.p3")}</p>

        <h2>{t("legalPage.terms.h4")}</h2>
        <p>{t("legalPage.terms.p4")}</p>

        <h2>{t("legalPage.terms.h5")}</h2>
        <p>{t("legalPage.terms.p5")}</p>

        <h2>{t("legalPage.terms.h6")}</h2>
        <p>{t("legalPage.terms.p6")}</p>
      </>
    ),
  },

  "/teslimat-ve-iade": {
    title: t("legalPage.delivery.title"),
    description: t("legalPage.delivery.description"),
    updatedAt: t("legalPage.delivery.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.delivery.h1")}</h2>
        <p>{t("legalPage.delivery.p1")}</p>

        <h2>{t("legalPage.delivery.h2")}</h2>
        <p>{t("legalPage.delivery.p2")}</p>

        <h2>{t("legalPage.delivery.h3")}</h2>
        <p>{t("legalPage.delivery.p3")}</p>

        <h2>{t("legalPage.delivery.h4")}</h2>
        <p>{t("legalPage.delivery.p4")}</p>

        <h2>{t("legalPage.delivery.h5")}</h2>
        <p>{t("legalPage.delivery.p5")}</p>

        <h2>{t("legalPage.delivery.h6")}</h2>
        <p>{t("legalPage.delivery.p6")}</p>

        <h2>{t("legalPage.delivery.h7")}</h2>
        <p>{t("legalPage.delivery.p7")}</p>

        <h2>{t("legalPage.delivery.h8")}</h2>
        <p>{t("legalPage.delivery.p8", { email: contactEmail })}</p>
      </>
    ),
  },

  "/mesafeli-satis-sozlesmesi": {
    title: t("legalPage.distanceSales.title"),
    description: t("legalPage.distanceSales.description"),
    updatedAt: t("legalPage.distanceSales.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.distanceSales.h1")}</h2>
        <p>{t("legalPage.distanceSales.p1")}</p>

        <h2>{t("legalPage.distanceSales.h2")}</h2>
        <p>{t("legalPage.distanceSales.p2")}</p>

        <h2>{t("legalPage.distanceSales.h3")}</h2>
        <p>{t("legalPage.distanceSales.p3")}</p>

        <h2>{t("legalPage.distanceSales.h4")}</h2>
        <p>{t("legalPage.distanceSales.p4")}</p>

        <h2>{t("legalPage.distanceSales.h5")}</h2>
        <p>{t("legalPage.distanceSales.p5")}</p>

        <h2>{t("legalPage.distanceSales.h6")}</h2>
        <p>{t("legalPage.distanceSales.p6")}</p>

        <h2>{t("legalPage.distanceSales.h7")}</h2>
        <p>{t("legalPage.distanceSales.p7")}</p>

        <h2>{t("legalPage.distanceSales.h8")}</h2>
        <p>{t("legalPage.distanceSales.p8")}</p>

        <h2>{t("legalPage.distanceSales.h9")}</h2>
        <p>{t("legalPage.distanceSales.p9")}</p>

        <h2>{t("legalPage.distanceSales.h10")}</h2>
        <p>{t("legalPage.distanceSales.p10", { email: contactEmail })}</p>
      </>
    ),
  },

  "/cerez-politikasi": {
    title: t("legalPage.cookies.title"),
    description: t("legalPage.cookies.description"),
    updatedAt: t("legalPage.cookies.updatedAt"),
    content: (
      <>
        <h2>{t("legalPage.cookies.h1")}</h2>
        <p>{t("legalPage.cookies.p1")}</p>

        <h2>{t("legalPage.cookies.h2")}</h2>
        <p>{t("legalPage.cookies.p2")}</p>

        <h2>{t("legalPage.cookies.h3")}</h2>
        <p>{t("legalPage.cookies.p3")}</p>

        <h2>{t("legalPage.cookies.h4")}</h2>
        <p>{t("legalPage.cookies.p4")}</p>
      </>
    ),
  },
});

export default function LegalPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const pages = buildPages(t);
  const page = pages[location.pathname] || pages["/kullanim-kosullari"];

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
          {t("legalPage.backHome")}
        </Link>

        <h1 style={titleStyle}>{page.title}</h1>
        <p style={updatedStyle}>
          {t("legalPage.lastUpdated")} {page.updatedAt}
        </p>

        <div style={contentStyle}>{page.content}</div>
      </article>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "48px 20px",
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
  marginBottom: 24,
  color: "#2563eb",
  textDecoration: "none",
  fontWeight: 700,
};

const titleStyle: CSSProperties = {
  margin: 0,
  color: "#0f172a",
  fontSize: "clamp(32px, 5vw, 48px)",
};

const updatedStyle: CSSProperties = {
  marginTop: 12,
  color: "#64748b",
};

const contentStyle: CSSProperties = {
  marginTop: 36,
  color: "#334155",
  fontSize: 16,
  lineHeight: 1.8,
};
