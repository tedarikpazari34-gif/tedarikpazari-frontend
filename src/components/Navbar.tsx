import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { disconnectSocket, getSocket } from "../lib/socket";
import { enablePushNotifications } from "../pushNotifications";
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from "../constants/languages";

type NavItem = {
  labelKey: string;
  to: string;
};

type CategoryNavItem = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: CategoryNavItem[];
};

const API =
  import.meta.env.VITE_API_URL || "https://tedarik-backend.onrender.com/api";

type CategoryMenuGroup = {
  label: string;
  icon: string;
  categories: string[];
};

const categoryMenuGroups: CategoryMenuGroup[] = [
  {
    label: "Elektronik & Bilişim",
    icon: "⌁",
    categories: [
      "Elektronik, Bilişim & Teknoloji",
      "Elektrik ve Aydınlatma",
      "Enerji ve Güneş Sistemleri",
    ],
  },
  {
    label: "Ev, Yaşam & Ofis",
    icon: "⌂",
    categories: [
      "Mobilya ve Ofis",
      "Kırtasiye ve Matbaa",
      "Eğitim ve Okul Malzemeleri",
      "Reklam ve Promosyon",
    ],
  },
  {
    label: "Oto, Bahçe & Yapı Market",
    icon: "⚙",
    categories: [
      "Otomotiv ve Yedek Parça",
      "Hırdavat",
      "İnşaat ve Yapı Malzemeleri",
      "Su ve Tesisat",
      "İklimlendirme ve HVAC",
      "Güvenlik ve Yangın Sistemleri",
    ],
  },
  {
    label: "Gıda & Horeca",
    icon: "♨",
    categories: [
      "Gıda ve Horeca",
      "Ambalaj ve Paketleme",
    ],
  },
  {
    label: "Kozmetik & Kişisel Bakım",
    icon: "✦",
    categories: [
      "Kozmetik ve Kuaför",
      "Temizlik ve Hijyen",
    ],
  },
  {
    label: "Moda & Tekstil",
    icon: "◇",
    categories: [
      "Tekstil ve Konfeksiyon",
    ],
  },
  {
    label: "Sağlık & Medikal",
    icon: "✚",
    categories: [
      "Medikal ve Sağlık",
      "Dental ve Diş Hekimliği",
      "Laboratuvar",
      "Veteriner ve Pet Ürünleri",
    ],
  },
  {
    label: "Sanayi & Üretim",
    icon: "⚒",
    categories: [
      "Makine ve Ekipman",
      "Sanayi Sarf Malzemeleri",
      "Maden ve Endüstriyel Üretim",
      "Metal ve Çelik",
      "Plastik ve Kimya",
      "Fason Üretim ve Özel Üretim",
      "Tarım ve Hayvancılık",
      "Lojistik ve Depolama",
    ],
  },
];

const publicLinks: NavItem[] = [
  { labelKey: "common.home", to: "/" },
  { labelKey: "common.products", to: "/products" },
];

const buyerLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/buyer/dashboard" },
  { labelKey: "common.home", to: "/" },
  { labelKey: "common.products", to: "/products" },
  { labelKey: "common.myOrders", to: "/buyer/orders" },
  { labelKey: "common.shippingQuotes", to: "/buyer/shipping-quotes" },
  { labelKey: "common.favorites", to: "/favorites" },
  { labelKey: "common.messages", to: "/chat" },
  { labelKey: "common.wallet", to: "/wallet" },
  { labelKey: "common.companyVerification", to: "/company/verification" },
];

const sellerLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/seller/dashboard" },
  { labelKey: "common.myOrders", to: "/seller/orders" },
  { labelKey: "common.myProducts", to: "/seller/products" },
  { labelKey: "common.companyProfile", to: "/seller/profile" },
  { labelKey: "common.wallet", to: "/wallet" },
  { labelKey: "common.messages", to: "/chat" },
  { labelKey: "common.companyVerification", to: "/company/verification" },
];

const logisticsLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/logistics/dashboard" },
  { labelKey: "common.openLoads", to: "/logistics/shipping" },
  { labelKey: "common.myShipments", to: "/logistics/orders" },
  { labelKey: "common.messages", to: "/chat" },
];

const adminLinks: NavItem[] = [
  { labelKey: "common.dashboard", to: "/admin" },
  { labelKey: "common.companies", to: "/admin/companies" },
  { labelKey: "common.verificationRequests", to: "/admin/verification-requests" },
  { labelKey: "common.productManagement", to: "/admin/products" },
  { labelKey: "common.disputes", to: "/admin/disputes" },
  { labelKey: "common.finance", to: "/admin/finance" },
  { labelKey: "common.chatModeration", to: "/admin/chat-moderation" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 980,
  );
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const [activeCategoryGroup, setActiveCategoryGroup] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [navCategories, setNavCategories] = useState<CategoryNavItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted",
  );
  const [pushLoading, setPushLoading] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const roleLinks: NavItem[] =
    role === "BUYER"
      ? buyerLinks
      : role === "SELLER"
        ? sellerLinks
        : role === "LOGISTICS"
          ? logisticsLinks
          : role === "ADMIN"
            ? adminLinks
            : publicLinks;

  const mobileSectionTitle =
    role === "BUYER"
      ? t("common.buyerPanel")
      : role === "SELLER"
        ? t("common.sellerPanel")
        : role === "LOGISTICS"
          ? t("common.logisticsPanel")
          : role === "ADMIN"
            ? t("common.adminPanel")
            : t("common.menu");

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 980;
      setIsMobile(mobile);

      if (!mobile) {
        setOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadNavCategories() {
      try {
        const response = await fetch(`${API}/categories/tree`);
        if (!response.ok) return;

        const data = await response.json();
        if (!active || !Array.isArray(data)) return;

        setNavCategories(
          data.filter((category: CategoryNavItem) => !category.parentId),
        );
      } catch {
        // Navbar kategori servisi geçici olarak erişilemezse navigasyon çalışmaya devam eder.
      }
    }

    loadNavCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("tedarikCart") || "[]");
        setCartCount(
          Array.isArray(cart)
            ? cart.reduce((total, item) => total + Number(item?.quantity || 0), 0)
            : 0,
        );
      } catch {
        setCartCount(0);
      }
    };

    loadCartCount();

    window.addEventListener("storage", loadCartCount);
    window.addEventListener(
      "tedarik-cart-changed",
      loadCartCount as EventListener,
    );

    return () => {
      window.removeEventListener("storage", loadCartCount);
      window.removeEventListener(
        "tedarik-cart-changed",
        loadCartCount as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        if (!token) {
          setUnreadCount(0);
          return;
        }

        const res = await fetch(`${API}/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          setUnreadCount(0);
          return;
        }

        setUnreadCount(Number(data?.count || 0));
      } catch (err) {
        console.error("NOTIFICATION COUNT ERROR:", err);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();

    const intervalId = window.setInterval(loadUnreadCount, 30000);

    window.addEventListener("storage", loadUnreadCount);
    window.addEventListener(
      "notifications-changed",
      loadUnreadCount as EventListener,
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", loadUnreadCount);
      window.removeEventListener(
        "notifications-changed",
        loadUnreadCount as EventListener,
      );
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket();

    const handleNewNotification = () => {
      setUnreadCount((current) => current + 1);

      window.dispatchEvent(new Event("notifications-changed"));
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    enablePushNotifications()
      .then(() => {
        setPushEnabled(true);
      })
      .catch((err) => {
        console.error("AUTO PUSH TOKEN ERROR:", err);
      });
  }, [token]);

  const enablePush = async () => {
    try {
      setPushLoading(true);
      await enablePushNotifications();
      setPushEnabled(true);
      alert(t("navbar.pushEnabledSuccess"));
    } catch (err: any) {
      alert(err?.message || t("navbar.pushEnableFailed"));
    } finally {
      setPushLoading(false);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      navigate("/products");
      return;
    }

    navigate(`/products?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const logout = () => {
    disconnectSocket();

    const language = localStorage.getItem("language");
    localStorage.clear();

    if (language) {
      localStorage.setItem("language", language);
    }

    setUnreadCount(0);
    setOpen(false);
    navigate("/login");
  };

  return (
    <header style={headerStyle}>
      {!isMobile && (
        <div style={trustBarStyle}>
          <div style={trustBarInnerStyle}>
          <div style={shoppingTopLinksStyle}>
            <Link to="/yardim" style={shoppingTopLinkStyle}>
              Destek Merkezi
            </Link>

            <Link
              to={token && role === "BUYER" ? "/favorites" : "/login"}
              style={shoppingTopLinkStyle}
            >
              ♡ Favorilerim
            </Link>

            <Link
              to={
                !token
                  ? "/login"
                  : role === "BUYER"
                    ? "/buyer/orders"
                    : role === "SELLER"
                      ? "/seller/orders"
                      : role === "LOGISTICS"
                        ? "/logistics/orders"
                        : "/panel"
              }
              style={shoppingTopLinkStyle}
            >
              ▣ Siparişlerim
            </Link>

            <Link
              to={token && role === "SELLER" ? "/seller/dashboard" : "/register?role=SELLER"}
              style={shoppingTopSellerLinkStyle}
            >
              Satıcı Ol
            </Link>
          </div>
        </div>
      </div>
      )}

      <div
        style={{
          ...barStyle,
          ...(isMobile
            ? {
                padding: "10px 14px 12px",
                gap: 10,
                flexWrap: "wrap",
              }
            : {}),
        }}
      >
        <Link
          to="/"
          style={brandStyle}
          onClick={() => setOpen(false)}
          aria-label="Nex Tedarik Pazarı ana sayfa"
        >
          <div
            style={{
              ...brandLogoStyle,
              ...(isMobile
                ? {
                    minWidth: 0,
                    height: 46,
                  }
                : {}),
            }}
          >
            <span
              style={{
                ...brandNexStyle,
                ...(isMobile ? { fontSize: 9, marginBottom: 3 } : {}),
              }}
            >
              NEX
            </span>
            <span
              style={{
                ...brandNameStyle,
                ...(isMobile ? { fontSize: 18, letterSpacing: -0.4 } : {}),
              }}
            >
              Tedarik <strong style={brandMarketStyle}>Pazarı</strong>
            </span>
          </div>
        </Link>

        <form
          onSubmit={handleSearch}
          style={{
            ...searchFormStyle,
            ...(isMobile
              ? {
                  order: 3,
                  flex: "1 0 100%",
                  width: "100%",
                  maxWidth: "none",
                  minWidth: 0,
                  height: 44,
                }
              : {}),
          }}
        >
          <span style={searchIconStyle} aria-hidden="true">⌕</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Ürün, kategori veya marka ara..."
            aria-label="Ürün ara"
            style={searchInputStyle}
          />
          <button type="submit" style={searchButtonStyle}>
            Ara
          </button>
        </form>

        <nav
          style={{
            ...desktopNavStyle,
            display: isMobile ? "none" : "flex",
          }}
        >
          {token ? (
            <div style={panelMenuWrapStyle}>
              <button
                type="button"
                onClick={() => setPanelMenuOpen((current) => !current)}
                style={shoppingActionStyle}
                aria-expanded={panelMenuOpen}
              >
                <span style={shoppingActionIconStyle}>♙</span>
                <span style={shoppingActionTextStyle}>
                  <small style={shoppingActionSmallStyle}>Hesabım</small>
                  <strong>Panelim</strong>
                </span>
                <span aria-hidden="true">{panelMenuOpen ? "▲" : "▼"}</span>
              </button>

              {panelMenuOpen && (
                <div style={panelDropdownStyle}>
                  <div style={panelDropdownTitleStyle}>{mobileSectionTitle}</div>

                  {roleLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setPanelMenuOpen(false)}
                      style={panelDropdownLinkStyle}
                    >
                      {t(item.labelKey)}
                    </Link>
                  ))}

                  <button
                    type="button"
                    onClick={logout}
                    style={panelLogoutStyle}
                  >
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={panelMenuWrapStyle}>
              <button
                type="button"
                onClick={() => setPanelMenuOpen((current) => !current)}
                style={shoppingActionStyle}
                aria-expanded={panelMenuOpen}
              >
                <span style={shoppingActionIconStyle}>♙</span>
                <span style={shoppingActionTextStyle}>
                  <small style={shoppingActionSmallStyle}>Giriş Yap</small>
                  <strong>Hesabım</strong>
                </span>
                <span style={accountChevronStyle} aria-hidden="true">
                  {panelMenuOpen ? "▲" : "▼"}
                </span>
              </button>

              {panelMenuOpen && (
                <div style={panelDropdownStyle}>
                  <Link
                    to="/login"
                    onClick={() => setPanelMenuOpen(false)}
                    style={guestLoginButtonStyle}
                  >
                    Giriş Yap
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setPanelMenuOpen(false)}
                    style={guestRegisterButtonStyle}
                  >
                    Üye Ol
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link
            to={token && role === "BUYER" ? "/favorites" : "/login"}
            style={shoppingActionStyle}
          >
            <span style={shoppingActionIconStyle}>♡</span>
            <span style={shoppingActionTextStyle}>
              <small style={shoppingActionSmallStyle}>Ürünler</small>
              <strong>Favorilerim</strong>
            </span>
          </Link>

          <Link
            to={token && role === "BUYER" ? "/cart" : token ? "/products" : "/login"}
            style={shoppingActionStyle}
          >
            <span style={shoppingActionIconStyle}>🛒</span>
            <span style={shoppingActionTextStyle}>
              <small style={shoppingActionSmallStyle}>Alışveriş</small>
              <strong>Sepetim</strong>
            </span>
            {role === "BUYER" && cartCount > 0 && (
              <span style={badgeStyle}>
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={{
            ...mobileButtonStyle,
            ...(isMobile
              ? {
                  display: "block",
                  marginLeft: "auto",
                  flexShrink: 0,
                  background: "#F3F8FC",
                  color: "#0B3D6E",
                  border: "1px solid #C9D9E5",
                }
              : { display: "none" }),
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      <div
        style={categoryBarStyle}
        onMouseLeave={() => setActiveCategoryGroup(null)}
      >
        <div
          style={{
            ...categoryBarInnerStyle,
            ...(isMobile
              ? {
                  width: "100%",
                  minHeight: 44,
                  overflowX: "auto",
                  overflowY: "hidden",
                  padding: "0 10px",
                  boxSizing: "border-box",
                  WebkitOverflowScrolling: "touch",
                }
              : {}),
          }}
        >
          <Link
            to="/categories"
            style={{
              ...allCategoriesLinkStyle,
              ...(isMobile
                ? {
                    minHeight: 44,
                    padding: "0 14px",
                    fontSize: 12,
                    borderRadius: 10,
                    margin: "5px 8px 5px 0",
                    whiteSpace: "nowrap",
                  }
                : {}),
            }}
            onMouseEnter={() => setActiveCategoryGroup(null)}
          >
            <span aria-hidden="true">☰</span>
            Tüm Kategoriler
          </Link>

          <div
            style={{
              ...categoryLinksStyle,
              ...(isMobile
                ? {
                    flex: "0 0 auto",
                    minWidth: "max-content",
                    overflow: "visible",
                    alignItems: "center",
                  }
                : {}),
            }}
          >
            {categoryMenuGroups.map((group) => (
              <button
                key={group.label}
                type="button"
                onMouseEnter={() => setActiveCategoryGroup(group.label)}
                onFocus={() => setActiveCategoryGroup(group.label)}
                style={{
                  ...categoryGroupButtonStyle,
                  ...(isMobile
                    ? {
                        flex: "0 0 auto",
                        minWidth: "max-content",
                        minHeight: 44,
                        padding: "0 12px",
                        gap: 7,
                        borderRight: "1px solid #edf2f7",
                        fontSize: 12,
                        whiteSpace: "nowrap",
                      }
                    : {}),
                }}
              >
                <span style={categoryGroupIconStyle} aria-hidden="true">
                  {group.icon}
                </span>
                <span>{group.label}</span>
              </button>
            ))}
          </div>
        </div>

        {activeCategoryGroup && (
          <div style={megaMenuStyle}>
            <div style={megaMenuInnerStyle}>
              {categoryMenuGroups
                .find((group) => group.label === activeCategoryGroup)
                ?.categories.map((categoryName) => {
                  const category = navCategories.find(
                    (item) => item.name === categoryName,
                  );

                  if (!category) return null;

                  return (
                    <div key={category.id} style={megaMenuColumnStyle}>
                      <Link
                        to={`/category/${category.id}`}
                        onClick={() => setActiveCategoryGroup(null)}
                        style={megaMenuHeadingStyle}
                      >
                        {category.name}
                      </Link>

                      <div style={megaMenuChildrenStyle}>
                        {(category.children || []).map((child) => (
                          <div key={child.id} style={megaMenuSubcategoryStyle}>
                            <Link
                              to={`/category/${child.id}`}
                              onClick={() => setActiveCategoryGroup(null)}
                              style={megaMenuChildStyle}
                            >
                              {child.name}
                            </Link>

                            {(child.children || []).length > 0 && (
                              <div style={megaMenuProductGroupsStyle}>
                                {(child.children || []).map((productGroup) => (
                                  <Link
                                    key={productGroup.id}
                                    to={`/category/${productGroup.id}`}
                                    onClick={() => setActiveCategoryGroup(null)}
                                    style={megaMenuProductGroupStyle}
                                  >
                                    {productGroup.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {open && (
        <div style={mobileMenuStyle}>
          <MobileSection
            title={mobileSectionTitle}
            items={roleLinks}
            close={() => setOpen(false)}
          />

          <LanguageSwitcher mobile />

          {role === "BUYER" && (
            <Link
              to="/cart"
              onClick={() => setOpen(false)}
              style={mobileNotificationStyle}
            >
              <span>🛒 {t("common.cart")}</span>
              {cartCount > 0 && (
                <span style={mobileBadgeStyle}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            style={mobileNotificationStyle}
          >
            🔔 {t("common.notifications")}
            {unreadCount > 0 && (
              <span style={mobileBadgeStyle}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {token ? (
            <button onClick={logout} style={mobileLogoutStyle}>
              {t("common.logout")}
            </button>
          ) : (
            <div style={mobileAuthStyle}>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={loginButtonStyle}
              >
                {t("common.login")}
              </Link>

              <Link
                to="/register"
                onClick={() => setOpen(false)}
                style={registerButtonStyle}
              >
                {t("common.register")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || "tr";

  const visibleLanguages = SUPPORTED_LANGUAGES.filter(
    (language) => ["tr", "en", "ka", "ru", "de", "ar", "uz"].includes(language.code)
  );

  const changeLanguage = (language: SupportedLanguageCode) => {
    i18n.changeLanguage(language);
  };

  return (
    <div style={mobile ? mobileLanguageStyle : languageStyle}>
      <span style={languageGlobeStyle} aria-hidden="true">🌐</span>

      <select
        value={visibleLanguages.find((language) =>
          currentLanguage.startsWith(language.code)
        )?.code || "tr"}
        onChange={(event) =>
          changeLanguage(event.target.value as SupportedLanguageCode)
        }
        aria-label={t("common.languageSelection")}
        style={languageSelectStyle}
      >
        {visibleLanguages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label} — {language.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function NavGroup({ items }: { items: NavItem[] }) {
  const { t } = useTranslation();

  return (
    <div style={navGroupStyle}>
      {items.map((item) => (
        <Link key={item.to} to={item.to} style={linkStyle}>
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}

function MobileSection({
  title,
  items,
  close,
}: {
  title: string;
  items: NavItem[];
  close: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div style={mobileSectionStyle}>
      <div style={mobileTitleStyle}>{title}</div>

      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={close}
          style={mobileLinkStyle}
        >
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );
}

const trustBarStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #062B4D 0%, #0B3D6E 100%)",
  color: "#ffffff",
};

const trustBarInnerStyle: React.CSSProperties = {
  width: "min(calc(100% - 40px), 1440px)",
  minHeight: 34,
  margin: "0 auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 0.15,
};

const shoppingTopLinksStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 22,
  whiteSpace: "normal",
  lineHeight: 1.15,
  textAlign: "center",
};

const shoppingTopLinkStyle: React.CSSProperties = {
  color: "#ffffff",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 750,
  opacity: 0.94,
};

const shoppingTopSellerLinkStyle: React.CSSProperties = {
  ...shoppingTopLinkStyle,
  color: "#bbf7d0",
  fontWeight: 900,
};

const trustLeadStyle: React.CSSProperties = {
  whiteSpace: "nowrap",
};

const trustItemsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 22,
  whiteSpace: "nowrap",
};

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(255,255,255,0.985)",
  backdropFilter: "blur(18px)",
  borderBottom: "1px solid #DCE6EE",
  boxShadow: "0 8px 28px rgba(11,61,110,0.08)",
};

const barStyle: React.CSSProperties = {
  maxWidth: 1440,
  margin: "0 auto",
  padding: "15px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 18,
};

const brandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexShrink: 0,
  textDecoration: "none",
};

const brandLogoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 190,
  height: 63,
  lineHeight: 1,
};

const brandNexStyle: React.CSSProperties = {
  color: "#16B83E",
  fontSize: 11,
  fontWeight: 950,
  letterSpacing: 2.4,
  marginBottom: 5,
};

const brandNameStyle: React.CSSProperties = {
  color: "#0B3D6E",
  fontSize: 21,
  fontWeight: 900,
  letterSpacing: -0.6,
  whiteSpace: "nowrap",
};

const brandMarketStyle: React.CSSProperties = {
  color: "#16B83E",
  fontWeight: 950,
};



const searchFormStyle: React.CSSProperties = {
  flex: "1 1 420px",
  maxWidth: 620,
  minWidth: 260,
  height: 48,
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  background: "white",
  border: "2px solid #C9D9E5",
  borderRadius: 14,
  boxShadow: "0 7px 20px rgba(11,61,110,0.07)",
};

const searchIconStyle: React.CSSProperties = {
  paddingLeft: 16,
  color: "#16A34A",
  fontSize: 24,
  fontWeight: 900,
  lineHeight: 1,
};

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  height: "100%",
  padding: "0 14px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#16324A",
  fontSize: 14,
  fontWeight: 600,
};

const searchButtonStyle: React.CSSProperties = {
  alignSelf: "stretch",
  minWidth: 78,
  border: "none",
  padding: "0 20px",
  background: "linear-gradient(135deg, #082F55 0%, #0B4C82 100%)",
  color: "white",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 900,
};

const categoryGroupIconStyle: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  width: 25,
  height: 25,
  flexShrink: 0,
  borderRadius: 8,
  background: "linear-gradient(135deg, #E8F2FA, #E9FBEF)",
  color: "#0B3D6E",
  fontSize: 16,
  fontWeight: 900,
};

const categoryGroupButtonStyle: React.CSSProperties = {
  flex: "1 1 0",
  minWidth: 0,
  minHeight: 54,
  padding: "0 7px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "none",
  borderRight: "1px solid #edf2f7",
  background: "#ffffff",
  color: "#0B3D6E",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const megaMenuStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  top: "100%",
  zIndex: 200,
  background: "#ffffff",
  borderTop: "3px solid #16B83E",
  borderBottom: "1px solid #e2e8f0",
  boxShadow: "0 22px 45px rgba(11,31,58,0.14)",
};

const megaMenuInnerStyle: React.CSSProperties = {
  width: "min(1400px, calc(100% - 48px))",
  margin: "0 auto",
  padding: "26px 0 30px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "26px 34px",
};

const megaMenuColumnStyle: React.CSSProperties = {
  minWidth: 0,
};

const megaMenuHeadingStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 10,
  color: "#123A63",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 900,
};

const megaMenuSubcategoryStyle: React.CSSProperties = {
  display: "grid",
  gap: 5,
};

const megaMenuProductGroupsStyle: React.CSSProperties = {
  display: "grid",
  gap: 4,
  paddingLeft: 10,
  borderLeft: "2px solid #dcfce7",
};

const megaMenuProductGroupStyle: React.CSSProperties = {
  color: "#64748b",
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: 1.35,
};

const megaMenuChildrenStyle: React.CSSProperties = {
  display: "grid",
  gap: 7,
};

const megaMenuChildStyle: React.CSSProperties = {
  color: "#526277",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.45,
};

const categoryBarStyle: React.CSSProperties = {
  width: "100%",
  background: "#ffffff",
  borderTop: "1px solid #edf2f7",
  borderBottom: "1px solid #e2e8f0",
};

const categoryBarInnerStyle: React.CSSProperties = {
  width: "min(1440px, calc(100% - 40px))",
  minHeight: 46,
  margin: "0 auto",
  display: "flex",
  alignItems: "stretch",
  overflow: "hidden",
};

const allCategoriesLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "0 20px",
  flexShrink: 0,
  background: "linear-gradient(135deg, #082F55 0%, #0B4C82 100%)",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};

const categoryLinksStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
};

const categoryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0 18px",
  flex: "1 0 auto",
  borderRight: "1px solid #edf2f7",
  color: "#123A63",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const panelMenuWrapStyle: React.CSSProperties = {
  position: "relative",
};

const panelMenuButtonStyle: React.CSSProperties = {
  height: 42,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "0 15px",
  border: "1px solid #dbe5ea",
  borderRadius: 12,
  background: "#ffffff",
  color: "#123A63",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const panelDropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 10px)",
  right: 0,
  zIndex: 100,
  width: 230,
  padding: 8,
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  background: "#ffffff",
  boxShadow: "0 22px 55px rgba(11,31,58,0.16)",
};

const panelDropdownTitleStyle: React.CSSProperties = {
  padding: "9px 11px",
  color: "#123A63",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 0.4,
  textTransform: "uppercase",
};

const panelDropdownLinkStyle: React.CSSProperties = {
  display: "block",
  padding: "10px 11px",
  borderRadius: 10,
  color: "#123A63",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 750,
};

const guestLoginButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 16px",
  borderRadius: 10,
  background: "linear-gradient(135deg, #16B83E 0%, #22C55E 100%)",
  color: "#ffffff",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 900,
};

const guestRegisterButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 42,
  marginTop: 8,
  padding: "0 16px",
  border: "1px solid #dbe5ea",
  borderRadius: 10,
  background: "#ffffff",
  color: "#123A63",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 850,
};

const shoppingActionStyle: React.CSSProperties = {
  position: "relative",
  minHeight: 48,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "5px 8px",
  border: "none",
  background: "transparent",
  color: "#123A63",
  textDecoration: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const accountChevronStyle: React.CSSProperties = {
  marginLeft: 2,
  color: "#64748b",
  fontSize: 9,
  lineHeight: 1,
};

const shoppingActionIconStyle: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1,
};

const shoppingActionTextStyle: React.CSSProperties = {
  display: "grid",
  gap: 1,
  textAlign: "left",
  fontSize: 13,
  lineHeight: 1.1,
};

const shoppingActionSmallStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 10,
  fontWeight: 650,
};

const panelLogoutStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "10px 11px",
  border: "none",
  borderTop: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#b91c1c",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 800,
};

const desktopNavStyle: React.CSSProperties = {
  display: window.innerWidth < 980 ? "none" : "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const navGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const linkStyle: React.CSSProperties = {
  color: "#334155",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: 13,
  padding: "9px 10px",
  borderRadius: 10,
};

const languageStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 8px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.06)",
};

const mobileLanguageStyle: React.CSSProperties = {
  ...languageStyle,
  justifyContent: "center",
  width: "100%",
  padding: 10,
};

const languageGlobeStyle: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1,
};

const languageSelectStyle: React.CSSProperties = {
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#e2e8f0",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 800,
  maxWidth: 150,
};

const bellStyle: React.CSSProperties = {
  position: "relative",
  width: 42,
  height: 42,
  borderRadius: 14,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  display: "grid",
  placeItems: "center",
  textDecoration: "none",
  fontSize: 18,
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: -6,
  right: -6,
  minWidth: 20,
  height: 20,
  borderRadius: 999,
  background: "#ef4444",
  color: "white",
  fontSize: 11,
  fontWeight: 900,
  display: "grid",
  placeItems: "center",
  padding: "0 5px",
};

const authGroupStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const loginButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 13,
};

const registerButtonStyle: React.CSSProperties = {
  textDecoration: "none",
  background: "#f05a18",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 900,
  fontSize: 13,
};

const pushButtonStyle: React.CSSProperties = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  borderRadius: 10,
  padding: "9px 12px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
};

const logoutButtonStyle: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 13,
};

const mobileButtonStyle: React.CSSProperties = {
  display: window.innerWidth < 980 ? "block" : "none",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.14)",
  width: 42,
  height: 42,
  borderRadius: 12,
  fontSize: 20,
  cursor: "pointer",
};

const mobileMenuStyle: React.CSSProperties = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "0 20px 18px",
  display: "grid",
  gap: 12,
};

const mobileSectionStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 14,
  display: "grid",
  gap: 8,
};

const mobileTitleStyle: React.CSSProperties = {
  color: "#38bdf8",
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 4,
};

const mobileLinkStyle: React.CSSProperties = {
  color: "#e2e8f0",
  textDecoration: "none",
  fontWeight: 800,
  padding: "9px 0",
};

const mobileNotificationStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  padding: 14,
  color: "#e2e8f0",
  textDecoration: "none",
  fontWeight: 900,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const mobileBadgeStyle: React.CSSProperties = {
  background: "#ef4444",
  color: "white",
  borderRadius: 999,
  padding: "3px 8px",
  fontSize: 12,
  fontWeight: 900,
};

const mobileAuthStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
};

const mobileLogoutStyle: React.CSSProperties = {
  ...logoutButtonStyle,
  width: "100%",
};
