import { sectors } from "../data/sectors";

export default function PopularSectors() {
  return (
    <section style={{ padding: 40 }}>
      <h2>Popüler Kategoriler</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {sectors.map((sector) => (
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
            <h3>{sector.name}</h3>
            <p>{sector.shortDescription}</p>
          </div>
        ))}
      </div>
    </section>
  );
}