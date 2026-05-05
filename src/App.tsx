import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import PanelPage from "./pages/PanelPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import BuyerOrdersPage from "./pages/BuyerOrdersPage";
import SellerOrdersPage from "./pages/SellerOrdersPage";
import BuyerRfqDetailPage from "./pages/BuyerRfqDetailPage";
import BuyerRfqsPage from "./pages/BuyerRfqsPage";
import SellerRfqsPage from "./pages/SellerRfqsPage";
import LogisticsShippingPage from "./pages/LogisticsShippingPage";
import BuyerShippingQuotesPage from "./pages/BuyerShippingQuotesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCompaniesPage from "./pages/AdminCompaniesPage";
import SellerProductCreatePage from "./pages/SellerProductCreatePage";
import CategoryPage from "./pages/CategoryPage";
import Navbar from "./components/Navbar";
import ProductDetailPage from "./pages/ProductDetailPage";
import BuyerQuotesPage from "./pages/BuyerQuotesPage";
import SellerProductsPage from "./pages/SellerProductsPage";
import SellerQuotesPage from "./pages/SellerQuotesPage";
import SellerQuoteCreatePage from "./pages/SellerQuoteCreatePage";
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
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/uyelik" element={<RegisterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* CATEGORY */}
        <Route path="/category/:id" element={<CategoryPage />} />

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
          path="/buyer/rfqs/:id"
          element={
            <PrivateRoute role="BUYER">
              <BuyerRfqDetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/buyer/shipping"
          element={
            <PrivateRoute role="BUYER">
              <BuyerShippingQuotesPage />
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
          path="/seller/products/new"
          element={
            <PrivateRoute role="SELLER">
              <SellerProductCreatePage />
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

        {/* LOGISTICS */}
        <Route
          path="/logistics/shipping"
          element={
            <PrivateRoute role="LOGISTICS">
              <LogisticsShippingPage />
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
        <Route path="/product/:id" element={<ProductDetailPage />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}