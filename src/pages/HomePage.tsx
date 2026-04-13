import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PopularSectors from "../components/PopularSectors";
// <PopularSectors />
export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>
          Tedarik Pazarı | İşletmeler için B2B Toptan Tedarik Platformu
        </title>

        <meta
          name="description"
          content="Tedarik Pazarı ile işletmeniz için toptan ürünleri keşfedin, tedarikçilerden teklif alın ve B2B satın alma sürecinizi yönetin."
        />

        <link rel="canonical" href="https://tedarikpazari.com/" />

        <meta property="og:title" content="Tedarik Pazarı" />
        <meta property="og:description" content="B2B tedarik platformu" />
        <meta property="og:url" content="https://tedarikpazari.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
       <div style={{ background: "red", padding: 20 }}>
         TEST ÇALIŞIYOR
       </div>
      <div
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "#fff",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {/* HEADER */}
          <h1 style={{ fontSize: 40 }}>
            Türkiye B2B Toptan Tedarik Platformu
          </h1>

          {/* BUTTONS */}
          <div style={{ marginBottom: 30 }}>
            <Link to="/uyelik">Üye Ol</Link> |{" "}
            <Link to="/panel">Giriş Yap</Link>
          </div>

          {/* 🔥 BURASI KRİTİK */}
          <div style={{ background: "red", padding: 20 }}>
  TEST ÇALIŞIYOR
</div>

<PopularSectors />

        </div>
      </div>
    </>
  );
}