import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHeroCopy } from "./NexHomeHero.copy";
import "./NexHomeHero.css";

export default function NexHomeHero() {
  const { i18n } = useTranslation();
  const language = i18n.language || "tr";
  const content = getHeroCopy(language);

  return (
    <section
      className="nex-home-hero"
      dir={language.toLowerCase().startsWith("ar") ? "rtl" : "ltr"}
      aria-labelledby="nex-home-title"
    >
      <div className="nex-home-hero-content">
        <div className="nex-home-hero-eyebrow">
          <span className="nex-home-hero-dot" />
          {content.eyebrow}
        </div>

        <h1 id="nex-home-title">{content.title}</h1>

        <p className="nex-home-hero-description">
          {content.description}
        </p>

        <div className="nex-home-hero-actions">
          <Link to="/products" className="nex-home-hero-primary">
            {content.products}
            <span aria-hidden="true">→</span>
          </Link>

          <Link
            to="/register?role=SELLER"
            className="nex-home-hero-secondary"
          >
            {content.seller}
          </Link>
        </div>

        <Link to="/categories" className="nex-home-hero-categories">
          {content.categories}
          <span aria-hidden="true"> ↗</span>
        </Link>

        <div className="nex-home-hero-trust">
          <span>✓ {content.trust}</span>
          <span>✓ {content.payment}</span>
          <span>✓ {content.wholesale}</span>
        </div>
      </div>

      <div className="nex-home-hero-image">
        <img
          src="/images/nex-hero-b2b.jpg"
          alt={content.imageAlt}
          fetchPriority="high"
        />
        <div className="nex-home-hero-image-shade" />
        <div className="nex-home-hero-image-caption">
          <span>NEX</span>
          <strong>{content.title}</strong>
        </div>
      </div>
    </section>
  );
}
