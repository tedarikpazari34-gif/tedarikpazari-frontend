import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VerifyEmailPage from "./pages/VerifyEmailPage";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";

import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AccountSecurityPage from "./pages/AccountSecurityPage";

import CategoryPage from "./pages/CategoryPage";
import AllCategoriesPage from "./pages/AllCategoriesPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";

import BuyerOrdersPage from "./pages/BuyerOrdersPage";

import SellerOrdersPage from "./pages/SellerOrdersPage";
import SellerChargebacksPage from "./pages/SellerChargebacksPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import SellerProductCreatePage from "./pages/SellerProductCreatePage";
import SellerProductBulkImportPage from "./pages/SellerProductBulkImportPage";
import SellerProfilePage from "./pages/SellerProfilePage";

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminDisputesPage from "./pages/AdminDisputesPage";
import AdminChargebacksPage from "./pages/AdminChargebacksPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import AdminFinancePage from "./pages/AdminFinancePage";
import AdminPayoutsPage from "./pages/AdminPayoutsPage";
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
import SellerLayout from "./components/SellerLayout";
import LogisticsDashboardPage from "./pages/LogisticsDashboardPage";
import LegalPage from "./pages/LegalPage";
import CorporatePage from "./pages/CorporatePage";
import CompanyVerificationPage from "./pages/CompanyVerificationPage";
import AdminVerificationRequestsPage from "./pages/AdminVerificationRequestsPage";
import RolePanelLayout from "./components/dashboard/RolePanelLayout";

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

function FirstReleasePanelRedirect() {
  const role = String(
    localStorage.getItem("role") || ""
  ).toUpperCase();

  const destinations: Record<string, string> = {
    BUYER: "/buyer/dashboard",
    SELLER: "/seller/dashboard",
    ADMIN: "/admin",
    LOGISTICS: "/logistics/dashboard",
  };

  return (
    <Navigate
      to={destinations[role] || "/login"}
      replace
    />
  );
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
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {/* LEGAL */}
        <Route path="/kvkk" element={<LegalPage />} />
        <Route path="/aydinlatma-metni" element={<LegalPage />} />
        <Route path="/gizlilik-politikasi" element={<LegalPage />} />
        <Route path="/kullanim-kosullari" element={<LegalPage />} />
        <Route path="/teslimat-ve-iade" element={<LegalPage />} />
        <Route path="/mesafeli-satis-sozlesmesi" element={<LegalPage />} />
        <Route path="/cerez-politikasi" element={<LegalPage />} />

        {/* CORPORATE */}
        <Route path="/hakkimizda" element={<CorporatePage />} />
        <Route path="/iletisim" element={<CorporatePage />} />
        <Route path="/yardim" element={<CorporatePage />} />

        {/* CATEGORY */}
        <Route path="/categories" element={<AllCategoriesPage />} />
        <Route path="/category/:id" element={<CategoryPage />} />

        {/* PRODUCT */}
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* BUYER */}
        <Route
          path="/buyer/orders"
          element={
            <PrivateRoute role="BUYER">
              <RolePanelLayout role="BUYER"><BuyerOrdersPage /></RolePanelLayout>
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

        {/* BUYER COMPANY PROFILE */}
        <Route
          path="/buyer/profile"
          element={
            <PrivateRoute role="BUYER">
              <RolePanelLayout role="BUYER"><SellerProfilePage /></RolePanelLayout>
            </PrivateRoute>
          }
        />

        {/* SELLER */}
        <Route
          path="/seller/profile"
          element={
            <PrivateRoute role="SELLER">
              <SellerLayout><SellerProfilePage /></SellerLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/orders"
          element={
            <PrivateRoute role="SELLER">
              <SellerLayout><SellerOrdersPage /></SellerLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/chargebacks"
          element={
            <PrivateRoute role="SELLER">
              <SellerChargebacksPage />
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
          path="/seller/products/import"
          element={
            <PrivateRoute role="SELLER">
              <SellerProductBulkImportPage />
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
          path="/seller/products/:id/edit"
          element={
            <PrivateRoute role="SELLER">
              <SellerProductCreatePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/seller/products/:id/view"
          element={
            <PrivateRoute role="SELLER">
              <ProductDetailPage />
            </PrivateRoute>
          }
        />

        <Route path="/buyer/security" element={
          <PrivateRoute role="BUYER">
            <RolePanelLayout role="BUYER"><AccountSecurityPage /></RolePanelLayout>
          </PrivateRoute>
        } />
        <Route path="/seller/security" element={
          <PrivateRoute role="SELLER">
            <SellerLayout><AccountSecurityPage /></SellerLayout>
          </PrivateRoute>
        } />
        <Route path="/admin/security" element={
          <AdminRoute><AccountSecurityPage /></AdminRoute>
        } />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrdersPage />
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
              <RolePanelLayout role="ADMIN"><AdminCompaniesPage /></RolePanelLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/verification-requests"
          element={
            <AdminRoute>
              <RolePanelLayout role="ADMIN"><AdminVerificationRequestsPage /></RolePanelLayout>
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
          path="/admin/disputes"
          element={
            <AdminRoute>
              <AdminDisputesPage />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/chargebacks"
          element={
            <AdminRoute>
              <AdminChargebacksPage />
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
          path="/admin/payouts"
          element={
            <AdminRoute>
              <AdminPayoutsPage />
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
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        {/* FALLBACK */}
        <Route path="/reviews/new" element={<CreateReviewPage />} />
        <Route path="/store/:id" element={<SellerStorePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          path="/admin/chat-moderation"
          element={
            <AdminRoute>
              <RolePanelLayout role="ADMIN"><AdminChatModerationPage /></RolePanelLayout>
            </AdminRoute>
          }
        />
        <Route
          path="/logistics/shipping"
          element={
            <PrivateRoute role="LOGISTICS">
              <Navigate to="/logistics/orders" replace />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/shipping-quotes"
          element={
            <PrivateRoute role="BUYER">
              <RolePanelLayout role="BUYER"><BuyerShippingQuotesPage /></RolePanelLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/shipping-request"
          element={
            <PrivateRoute role="BUYER">
              <Navigate to="/buyer/orders" replace />
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
              <SellerLayout><SellerDashboardPage /></SellerLayout>
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
              <FirstReleasePanelRedirect />
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
