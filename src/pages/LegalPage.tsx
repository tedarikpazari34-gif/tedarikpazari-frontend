import type { CSSProperties, ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

type LegalContent = {
  title: string;
  description: string;
  updatedAt: string;
  content: ReactNode;
};

const companyName = "Tedarik Pazarı";
const contactEmail = "info@tedarikpazarı.com";

const pages: Record<string, LegalContent> = {
  "/kvkk": {
    title: "Kişisel Verilerin Korunması Politikası",
    description:
      "Tedarik Pazarı kişisel verilerin korunması ve işlenmesine ilişkin genel politika.",
    updatedAt: "15 Temmuz 2026",
    content: (
      <>
        <h2>1. Amaç ve kapsam</h2>
        <p>
          Bu politika, {companyName} tarafından işlenen kişisel verilerin
          korunmasına ilişkin genel esasları açıklar.
        </p>

        <h2>2. İşlenen veri kategorileri</h2>
        <p>
          Kimlik, iletişim, firma, işlem güvenliği, müşteri işlemi, finans,
          sipariş, teklif, destek ve hukuki işlem verileri işlenebilir.
        </p>

        <h2>3. İşleme amaçları</h2>
        <p>
          Üyelik ve firma süreçlerinin yürütülmesi, RFQ ve teklif işlemlerinin
          gerçekleştirilmesi, sipariş ve ödeme süreçlerinin yönetilmesi,
          güvenliğin sağlanması, destek hizmetlerinin sunulması ve hukuki
          yükümlülüklerin yerine getirilmesi amaçlarıyla veri işlenebilir.
        </p>

        <h2>4. Saklama ve güvenlik</h2>
        <p>
          Kişisel veriler, ilgili mevzuatta öngörülen süreler ve işleme amacı
          için gerekli süre boyunca saklanır. Yetkisiz erişime karşı uygun
          teknik ve idari tedbirler uygulanır.
        </p>

        <h2>5. Başvuru</h2>
        <p>
          Kişisel verilerinizle ilgili taleplerinizi {contactEmail} adresine
          iletebilirsiniz.
        </p>
      </>
    ),
  },

  "/aydinlatma-metni": {
    title: "KVKK Aydınlatma Metni",
    description:
      "Tedarik Pazarı kullanıcıları için kişisel veri işleme aydınlatma metni.",
    updatedAt: "15 Temmuz 2026",
    content: (
      <>
        <h2>Veri sorumlusu</h2>
        <p>
          Veri sorumlusu: {companyName}. Şirketin tam ticari unvanı, MERSİS
          numarası, adresi ve iletişim bilgileri yayına alınmadan önce bu
          bölüme eklenmelidir.
        </p>

        <h2>İşlenen kişisel veriler</h2>
        <p>
          Ad, soyad, e-posta, telefon, firma bilgileri, vergi ve ticaret
          bilgileri, IP ve oturum kayıtları, teklif, sipariş, ödeme, kargo,
          mesajlaşma ve destek verileri işlenebilir.
        </p>

        <h2>İşleme amaçları ve hukuki sebepler</h2>
        <p>
          Veriler; sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin
          yerine getirilmesi, hakkın tesisi veya korunması ve meşru menfaat
          hukuki sebeplerine dayanılarak işlenebilir. Açık rıza gereken
          faaliyetlerde ayrıca ve bağımsız açık rıza alınır.
        </p>

        <h2>Aktarım</h2>
        <p>
          Veriler; ödeme, barındırma, e-posta, kargo, destek ve güvenlik
          hizmeti sunan tedarikçilere, yetkili kamu kurumlarına ve hukuken
          yetkili kişilere amaçla sınırlı olarak aktarılabilir.
        </p>

        <h2>Haklarınız</h2>
        <p>
          6698 sayılı Kanun kapsamındaki bilgi alma, düzeltme, silme,
          itiraz ve zararın giderilmesini talep etme haklarınızı
          {contactEmail} adresi üzerinden kullanabilirsiniz.
        </p>
      </>
    ),
  },

  "/gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    description:
      "Tedarik Pazarı internet sitesi ve mobil uygulaması gizlilik politikası.",
    updatedAt: "14 Ağustos 2026",
    content: (
      <>
        <h2>1. Kapsam</h2>
        <p>
          Bu Gizlilik Politikası, Tedarik Pazarı internet sitesi ve mobil
          uygulamasının kullanımı sırasında işlenen bilgileri açıklar.
        </p>

        <h2>2. İşlenebilecek bilgiler</h2>
        <p>
          Hesap ve iletişim bilgileri, firma bilgileri, ürün ve hizmet
          bilgileri, teklif talepleri, teklifler, siparişler, kargo ve
          işlem kayıtları ile destek ve mesajlaşma verileri işlenebilir.
        </p>

        <h2>3. Fotoğraf, kamera ve dosya erişimi</h2>
        <p>
          Kullanıcılar ürün, firma, uyuşmazlık veya diğer gerekli görselleri
          yüklemek istediklerinde cihazlarındaki fotoğraf arşivinden seçim
          yapabilir, dosya seçebilir veya kamera ile yeni bir görsel
          oluşturabilir. Bu erişimler yalnızca kullanıcı tarafından ilgili
          özellik kullanıldığında gerçekleştirilir.
        </p>

        <h2>4. Verilerin kullanım amaçları</h2>
        <p>
          Bilgiler; hesap ve firma işlemlerinin yürütülmesi, alıcı ve
          satıcıların buluşturulması, RFQ ve teklif süreçlerinin yönetilmesi,
          sipariş ve teslimat işlemlerinin gerçekleştirilmesi, bildirimlerin
          iletilmesi, güvenliğin sağlanması ve kullanıcı desteği sunulması
          amacıyla kullanılabilir.
        </p>

        <h2>5. Bildirimler</h2>
        <p>
          Kullanıcılara teklif, sipariş, ödeme, teslimat ve hesap
          hareketleriyle ilgili hizmet bildirimleri gönderilebilir.
        </p>

        <h2>6. Ödeme ve finansal bilgiler</h2>
        <p>
          Ödeme özellikleri kullanıma sunulduğunda ödeme işlemleri yetkili
          ödeme hizmeti sağlayıcıları aracılığıyla gerçekleştirilebilir.
          Kart bilgileri, kullanılan ödeme altyapısının güvenlik ve
          saklama kurallarına tabi olabilir.
        </p>

        <h2>7. Hizmet sağlayıcıları</h2>
        <p>
          Platformun işletilmesi için barındırma, veritabanı, e-posta,
          bildirim, dosya depolama, güvenlik ve gerektiğinde ödeme hizmeti
          sağlayıcılarından yararlanılabilir. Bilgiler yalnızca hizmetin
          gerektirdiği ölçüde paylaşılır.
        </p>

        <h2>8. Saklama ve güvenlik</h2>
        <p>
          Bilgiler, hizmetlerin sunulması ve yasal yükümlülüklerin yerine
          getirilmesi için gerekli süre boyunca saklanır. Yetkisiz erişim,
          kayıp ve kötüye kullanıma karşı uygun teknik ve idari tedbirler
          uygulanır.
        </p>

        <h2>9. Kullanıcı hakları</h2>
        <p>
          Kullanıcılar kişisel verileriyle ilgili bilgi alma, düzeltme,
          silme veya ilgili mevzuat kapsamındaki diğer haklarını kullanmak
          üzere bizimle iletişime geçebilir.
        </p>

        <h2>10. İletişim</h2>
        <p>
          Gizlilik ve kişisel verilerle ilgili talepler:
          {" "}{contactEmail}
        </p>
      </>
    ),
  },

  "/kullanim-kosullari": {
    title: "Kullanım Koşulları",
    description: "Tedarik Pazarı platform kullanım koşulları.",
    updatedAt: "15 Temmuz 2026",
    content: (
      <>
        <h2>1. Platformun niteliği</h2>
        <p>
          {companyName}, alıcılar ile satıcıları RFQ, teklif ve sipariş
          süreçlerinde bir araya getiren elektronik ticaret platformudur.
        </p>

        <h2>2. Üyelik ve firma bilgileri</h2>
        <p>
          Kullanıcılar doğru, güncel ve hukuka uygun bilgi vermekle
          yükümlüdür. Yanıltıcı, sahte veya üçüncü kişilere ait bilgi
          kullanılması yasaktır.
        </p>

        <h2>3. Teklif ve siparişler</h2>
        <p>
          Teklifin kabul edilmesiyle taraflar arasında sipariş ilişkisi
          kurulur. Satıcı ürün, fiyat, teslim süresi ve mevzuata uygunluktan;
          alıcı ödeme ve teslim alma yükümlülüklerinden sorumludur.
        </p>

        <h2>4. Ödeme, komisyon ve bakiye</h2>
        <p>
          Ödemeler yetkili ödeme kuruluşu üzerinden alınabilir. Platform
          komisyon oranı sipariş öncesinde gösterilir. Satıcı hak edişleri
          teslim, uyuşmazlık ve ödeme şartlarına göre cüzdana aktarılır.
        </p>

        <h2>5. Yasaklı kullanım</h2>
        <p>
          Hukuka aykırı ürün, yanıltıcı ilan, sahte belge, sistem güvenliğini
          tehlikeye atan işlem ve platform dışına yönlendirme amacı taşıyan
          kötüye kullanım yasaktır.
        </p>

        <h2>6. Uyuşmazlıklar</h2>
        <p>
          Taraflar platform içi uyuşmazlık sistemini kullanabilir. Yetkili
          hukuk ve mahkeme bilgileri, şirketin ticari merkezine göre hukukçu
          tarafından son metinde belirlenmelidir.
        </p>
      </>
    ),
  },

  "/cerez-politikasi": {
    title: "Çerez Politikası",
    description: "Tedarik Pazarı çerez kullanımı hakkında bilgilendirme.",
    updatedAt: "15 Temmuz 2026",
    content: (
      <>
        <h2>Çerez nedir?</h2>
        <p>
          Çerezler, internet sitesinin çalışması ve tercihlerin hatırlanması
          amacıyla cihazınıza kaydedilebilen küçük metin dosyalarıdır.
        </p>

        <h2>Kullanılabilecek çerezler</h2>
        <p>
          Zorunlu oturum, kimlik doğrulama, güvenlik ve tercih çerezleri
          kullanılabilir. Analitik veya pazarlama çerezleri kullanılacaksa,
          gerekli olduğu ölçüde önceden açık rıza alınır.
        </p>

        <h2>Çerez yönetimi</h2>
        <p>
          Çerez tercihleri tarayıcı ayarlarından değiştirilebilir. Zorunlu
          çerezlerin kapatılması platformun bazı özelliklerinin çalışmamasına
          yol açabilir.
        </p>

        <h2>Güncelleme</h2>
        <p>
          Gerçekte kullanılan her çerezin adı, sağlayıcısı, amacı ve saklama
          süresi canlıya çıkmadan önce bu metne tablo halinde eklenmelidir.
        </p>
      </>
    ),
  },
};

export default function LegalPage() {
  const location = useLocation();
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
          ← Ana sayfaya dön
        </Link>

        <h1 style={titleStyle}>{page.title}</h1>
        <p style={updatedStyle}>Son güncelleme: {page.updatedAt}</p>

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
