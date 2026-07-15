import type { CSSProperties, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

type PageContent = {
  title: string;
  description: string;
  content: ReactNode;
};

const pages: Record<string, PageContent> = {
  "/hakkimizda": {
    title: "Hakkımızda",
    description:
      "Tedarik Pazarı, işletmeleri güvenilir tedarikçilerle buluşturan B2B teklif ve sipariş platformudur.",
    content: (
      <>
        <h2>Tedarik süreçlerini kolaylaştırıyoruz</h2>
        <p>
          Tedarik Pazarı; alıcı işletmelerin ihtiyaç duydukları ürünler için
          talep oluşturmasını, satıcıların teklif vermesini ve ticaret
          sürecinin güvenli biçimde yürütülmesini sağlayan B2B pazaryeridir.
        </p>

        <h2>Nasıl çalışır?</h2>
        <p>
          Alıcı ürün veya tedarik talebi oluşturur. Uygun satıcılar fiyat,
          teslim süresi ve açıklamalarını içeren teklifler gönderir. Alıcı
          uygun teklifi seçer ve sipariş oluşturulur.
        </p>

        <h2>Güvenli ticaret</h2>
        <p>
          Ödeme, sipariş tamamlanana kadar güvenli ödeme altyapısı üzerinden
          korunur. Teslimat onayından sonra satıcının hak edişi bakiyesine
          aktarılır.
        </p>

        <h2>Vizyonumuz</h2>
        <p>
          Türkiye’deki işletmelerin daha hızlı, şeffaf ve güvenilir tedarik
          ilişkileri kurmasını sağlayan güçlü bir dijital ticaret ağı
          oluşturmaktır.
        </p>
      </>
    ),
  },

  "/iletisim": {
    title: "İletişim",
    description:
      "Tedarik Pazarı destek ve iletişim bilgileri.",
    content: (
      <>
        <h2>Bizimle iletişime geçin</h2>
        <p>
          Üyelik, firma onayı, ürünler, teklifler, siparişler ve ödeme
          süreçleri hakkında destek alabilirsiniz.
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
          <strong>E-posta</strong>
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

        <h2>Destek talebinizde bulunması gerekenler</h2>
        <p>
          Daha hızlı yardımcı olabilmemiz için firma adınızı, hesabınızda
          kullandığınız e-posta adresini ve yaşadığınız sorunun kısa
          açıklamasını paylaşın.
        </p>

        <h2>Güvenlik uyarısı</h2>
        <p>
          Şifrenizi, kart bilgilerinizi veya tek kullanımlık doğrulama
          kodlarınızı hiçbir destek mesajında paylaşmayın.
        </p>
      </>
    ),
  },

  "/yardim": {
    title: "Yardım Merkezi",
    description:
      "Tedarik Pazarı üyelik, RFQ, teklif, sipariş ve ödeme yardım merkezi.",
    content: (
      <>
        <h2>Nasıl üye olurum?</h2>
        <p>
          Üyelik sayfasından alıcı veya satıcı rolünü seçerek firma
          bilgilerinizi girin. Firma hesabınız yönetici kontrolünden sonra
          aktif hale gelir.
        </p>

        <h2>Nasıl teklif alırım?</h2>
        <p>
          Ürünü seçerek miktar ve talep notunuzu girin. Satıcı tarafından
          gönderilen teklifleri talep detay sayfasından karşılaştırabilirsiniz.
        </p>

        <h2>Satıcı nasıl teklif verir?</h2>
        <p>
          Satıcı panelindeki gelen talepler bölümünden birim fiyat, teslim
          süresi ve teklif notu girilerek teklif gönderilir.
        </p>

        <h2>Ödeme nasıl çalışır?</h2>
        <p>
          Kabul edilen teklif siparişe dönüştürülür. Ödeme güvenli ödeme
          ekranından tamamlanır ve sipariş teslim edilene kadar korunur.
        </p>

        <h2>Para çekme talebi nasıl oluşturulur?</h2>
        <p>
          Satıcı, tamamlanan siparişlerden kazandığı kullanılabilir bakiyeyi
          Cüzdanım sayfasından IBAN hesabına çekmek için talep oluşturabilir.
        </p>

        <h2>Uyuşmazlık yaşarsam ne yapmalıyım?</h2>
        <p>
          İlgili sipariş üzerinden uyuşmazlık oluşturabilir ve açıklamanızı
          platform yönetimine iletebilirsiniz.
        </p>
      </>
    ),
  },
};

export default function CorporatePage() {
  const location = useLocation();
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
          ← Ana sayfaya dön
        </Link>

        <div style={eyebrowStyle}>TEDARİK PAZARI</div>
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

