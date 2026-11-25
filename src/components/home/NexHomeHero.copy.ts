export const heroCopy = {
  tr: {
    eyebrow: "TÜRKİYE’NİN TOPTAN TİCARET PLATFORMU",
    title: "Yeni Pazarlara, Güçlü Bağlantılarla.",
    description: "İşletmeniz için doğru ürünleri keşfedin, doğrulanmış tedarikçilerle güçlü ticaret bağlantıları kurun.",
    products: "Ürünleri Keşfet",
    seller: "Satıcı Olarak Başla",
    categories: "Tüm Kategoriler",
    trust: "Doğrulanmış firmalar",
    payment: "Güvenli ödeme altyapısı",
    wholesale: "Toptan sipariş imkânı",
    imageAlt: "Toptan ticaret, depo ve tedarik ağı"
  },
  en: {
    eyebrow: "TÜRKİYE'S WHOLESALE TRADE PLATFORM",
    title: "New Markets, Stronger Connections.",
    description: "Discover products for your business and connect with verified suppliers.",
    products: "Explore Products",
    seller: "Become a Seller",
    categories: "All Categories",
    trust: "Verified companies",
    payment: "Secure payments",
    wholesale: "Wholesale orders",
    imageAlt: "Wholesale trade and supply network"
  },
  ka: {
    eyebrow: "თურქეთის საბითუმო სავაჭრო პლატფორმა",
    title: "ახალი ბაზრები, ძლიერი კავშირები.",
    description: "აღმოაჩინეთ პროდუქტები თქვენი ბიზნესისთვის და დაუკავშირდით დადასტურებულ მომწოდებლებს.",
    products: "პროდუქტების ნახვა",
    seller: "გახდით გამყიდველი",
    categories: "ყველა კატეგორია",
    trust: "დადასტურებული კომპანიები",
    payment: "უსაფრთხო გადახდა",
    wholesale: "საბითუმო შეკვეთები",
    imageAlt: "საბითუმო ვაჭრობა და მიწოდება"
  },
  ru: {
    eyebrow: "ПЛАТФОРМА ОПТОВОЙ ТОРГОВЛИ ТУРЦИИ",
    title: "Новые рынки, прочные связи.",
    description: "Находите товары для бизнеса и сотрудничайте с проверенными поставщиками.",
    products: "Смотреть товары",
    seller: "Стать продавцом",
    categories: "Все категории",
    trust: "Проверенные компании",
    payment: "Безопасные платежи",
    wholesale: "Оптовые заказы",
    imageAlt: "Оптовая торговля и поставки"
  },
  de: {
    eyebrow: "DIE GROSSHANDELSPLATTFORM DER TÜRKEI",
    title: "Neue Märkte, starke Verbindungen.",
    description: "Entdecken Sie Produkte für Ihr Unternehmen und vernetzen Sie sich mit verifizierten Lieferanten.",
    products: "Produkte entdecken",
    seller: "Verkäufer werden",
    categories: "Alle Kategorien",
    trust: "Verifizierte Unternehmen",
    payment: "Sichere Zahlung",
    wholesale: "Großhandelsbestellungen",
    imageAlt: "Großhandel und Liefernetzwerk"
  },
  ar: {
    eyebrow: "منصة تجارة الجملة في تركيا",
    title: "أسواق جديدة، روابط أقوى.",
    description: "اكتشف المنتجات المناسبة لشركتك وتواصل مع الموردين الذين تم التحقق منهم.",
    products: "استكشف المنتجات",
    seller: "ابدأ البيع",
    categories: "جميع الفئات",
    trust: "شركات موثقة",
    payment: "دفع آمن",
    wholesale: "طلبات بالجملة",
    imageAlt: "تجارة الجملة وشبكة التوريد"
  },
  uz: {
    eyebrow: "TURKIYANING ULGURJI SAVDO PLATFORMASI",
    title: "Yangi bozorlar, mustahkam aloqalar.",
    description: "Biznesingiz uchun mahsulotlarni toping va tasdiqlangan yetkazib beruvchilar bilan bog‘laning.",
    products: "Mahsulotlarni ko‘rish",
    seller: "Sotuvchi bo‘lish",
    categories: "Barcha toifalar",
    trust: "Tasdiqlangan kompaniyalar",
    payment: "Xavfsiz to‘lov",
    wholesale: "Ulgurji buyurtmalar",
    imageAlt: "Ulgurji savdo va yetkazib berish"
  }
} as const;

export function getHeroCopy(language: string) {
  const code = language.toLowerCase().split("-")[0];
  if (Object.prototype.hasOwnProperty.call(heroCopy, code)) {
    return heroCopy[code as keyof typeof heroCopy];
  }
  return heroCopy.tr;
}
