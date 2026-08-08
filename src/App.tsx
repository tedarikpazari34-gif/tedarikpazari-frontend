import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";

import BuyerOrdersPage from "./pages/BuyerOrdersPage";
import BuyerRfqDetailPage from "./pages/BuyerRfqDetailPage";
import BuyerRfqsPage from "./pages/BuyerRfqsPage";
import BuyerQuotesPage from "./pages/BuyerQuotesPage";
import CreateRfqPage from "./pages/CreateRfqPage";

import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerRfqsPage from "./pages/SellerRfqsPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import SellerProductCreatePage from "./pages/SellerProductCreatePage";
import SellerQuotesPage from "./pages/SellerQuotesPage";
import SellerQuoteCreatePage from "./pages/SellerQuoteCreatePage";
import SellerProfilePage from "./pages/SellerProfilePage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminPayoutsPage from "./pages/AdminPayoutsPage";
import AdminDisputesPage from "./pages/AdminDisputesPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import AdminFinancePage from "./pages/AdminFinancePage";
import AdminRoute from "./components/auth/AdminRoute";
import WalletPage from "./pages/WalletPage";
import ProductsPage from "./pages/ProductsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CreateReviewPage from "./pages/CreateReviewPage";
import FavoritesPage from "./pages/FavoritesPage";
import CompareProductsPage from "./pages/CompareProductsPage";
import ChatPage from "./pages/ChatPage";
import AdminChatModerationPage from "./pages/AdminChatModerationPage";
import AdminControlCenterPage from "./pages/AdminControlCenterPage";
import SellerStorePage from "./pages/SellerStorePage";
import LogisticsShippingPage from "./pages/LogisticsShippingPage";
import BuyerShippingQuotesPage from "./pages/BuyerShippingQuotesPage";
import BuyerShippingRequestPage from "./pages/BuyerShippingRequestPage";
import LogisticsOrdersPage from "./pages/LogisticsOrdersPage";
import BuyerDashboardPage from "./pages/BuyerDashboardPage";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import LogisticsDashboardPage from "./pages/LogisticsDashboardPage";
import PanelPage from "./pages/PanelPage";
import LegalPage from "./pages/LegalPage";
import CorporatePage from "./pages/CorporatePage";
import CompanyVerificationPage from "./pages/CompanyVerificationPage";

function PrivateRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "BUYER" | "SELLER" | "ADMIN" | "LOGISTICS";
}) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />

        <Route path="/uyelik" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* LEGAL */}
        <Route path="/kvkk" element={<LegalPage />} />
        <Route path="/aydinlatma-metni" element={<LegalPage />} />
        <Route path="/gizlilik-politikasi" element={<LegalPage />} />
        <Route path="/kullanim-kosullari" element={<LegalPage />} />
        <Route path="/cerez-politikasi" element={<LegalPage />} />

        {/* CORPORATE */}
        <Route path="/hakkimizda" element={<CorporatePage />} />
        <Route path="/iletisim" element={<CorporatePage />} />
        <Route path="/yardim" element={<CorporatePage />} />

        {/* CATEGORY */}
        <Route path="/category/:id" element={<CategoryPage />} />

        {/* PRODUCT */}
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* BUYER */}
        <Route
          path="/buyer/orders"
          element={
            <PrivateRoute role="BUYER">
              <BuyerOrdersPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/buyer/rfqs"
          element={
            <PrivateRoute role="BUYER">
              <BuyerRfqsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/buyer/rfqs/new"
          element={
            <PrivateRoute role="BUYER">
              <CreateRfqPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/buyer/rfqs/:id"
          element={
            <PrivateRoute role="BUYER">
              <BuyerRfqDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/tekliflerim"
          element={
            <PrivateRoute role="BUYER">
              <BuyerRfqsPage />
            </PrivateRoute>
          }
        />

        {/* COMPANY VERIFICATION */}
        <Route
          path="/company/verification"
          element={
            <PrivateRoute>
              <CompanyVerificationPage />
            </PrivateRoute>
          }
        />

        {/* SELLER */}
        <Route
          path="/seller/profile"
          element={
            <PrivateRoute role="SELLER">
              <SellerProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/orders"
          element={
            <PrivateRoute role="SELLER">
              <SellerOrdersPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/rfqs"
          element={
            <PrivateRoute role="SELLER">
              <SellerRfqsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/products"
          element={
            <PrivateRoute role="SELLER">
              <SellerProductsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/products/new"
          element={
            <PrivateRoute role="SELLER">
              <SellerProductCreatePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/quotes"
          element={
            <PrivateRoute role="SELLER">
              <SellerQuotesPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/quotes/create"
          element={
            <PrivateRoute role="SELLER">
              <SellerQuoteCreatePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/control-center"
          element={
            <AdminRoute>
              <AdminControlCenterPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/companies"
          element={
            <AdminRoute>
              <AdminCompaniesPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/payouts"
          element={
            <AdminRoute>
              <AdminPayoutsPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/disputes"
          element={
            <AdminRoute>
              <AdminDisputesPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/finance"
          element={
            <AdminRoute>
              <AdminFinancePage />
            </AdminRoute>
          }
        />

        <Route
          path="/favorites"
          element={
            <PrivateRoute role="BUYER">
              <FavoritesPage />
            </PrivateRoute>
          }
        />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/compare" element={<CompareProductsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        {/* FALLBACK */}
        <Route path="/reviews/new" element={<CreateReviewPage />} />
        <Route path="/store/:id" element={<SellerStorePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          path="/admin/chat-moderation"
          element={
            <AdminRoute>
              <AdminChatModerationPage />
            </AdminRoute>
          }
        />
        <Route
          path="/logistics/shipping"
          element={
            <PrivateRoute>
              <LogisticsShippingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/shipping-quotes"
          element={
            <PrivateRoute role="BUYER">
              <BuyerShippingQuotesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/shipping-request"
          element={
            <PrivateRoute role="BUYER">
              <BuyerShippingRequestPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/logistics/orders"
          element={
            <PrivateRoute role="LOGISTICS">
              <LogisticsOrdersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/dashboard"
          element={
            <PrivateRoute role="BUYER">
              <BuyerDashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/dashboard"
          element={
            <PrivateRoute role="SELLER">
              <SellerDashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/logistics/dashboard"
          element={
            <PrivateRoute role="LOGISTICS">
              <LogisticsDashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={<Navigate to="/admin" replace />}
        />
        <Route
          path="/panel"
          element={
            <PrivateRoute>
              <PanelPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <MobileBottomNav />
    </BrowserRouter>
  );
}
