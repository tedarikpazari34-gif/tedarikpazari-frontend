import { sectors } from "../data/sectors";
import { useTranslation } from "react-i18next";

export default function PopularSectors() {
  const { t } = useTranslation();

  return (
    <section style={{ padding: 40 }}>
      <h2>{t("popularSectors.title")}</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {sectors.map((sector) => {
          const key = sector.id.replace(/-/g, "_");

          return (
          <div
            key={sector.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
              background: "#fff",
            }}
          >
            <div style={{ fontSize: 24 }}>{sector.iconLetter}</div>
            <h3>{t(`popularSectors.sectors.${key}.name`, sector.name)}</h3>
            <p>
              {t(
                `popularSectors.sectors.${key}.description`,
                sector.shortDescription
              )}
            </p>
          </div>
          );
        })}
      </div>
    </section>
  );
}