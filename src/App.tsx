import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

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

import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import WalletPage from "./pages/WalletPage";
import ProductsPage from "./pages/ProductsPage";
import NotificationsPage from "./pages/NotificationsPage";

function PrivateRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: "BUYER" | "SELLER" | "ADMIN";
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
              <BuyerQuotesPage />
            </PrivateRoute>
          }
        />

        {/* SELLER */}
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

        {/* ADMIN */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="ADMIN">
              <AdminDashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/companies"
          element={
            <PrivateRoute role="ADMIN">
              <AdminCompaniesPage />
            </PrivateRoute>
          }
        />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}