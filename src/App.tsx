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
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/uyelik" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/buyer/orders"
          element={
            <PrivateRoute role="BUYER">
              <BuyerOrdersPage />
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
  path="/buyer/rfqs/:id"
  element={
    <PrivateRoute role="BUYER">
      <BuyerRfqDetailPage />
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
  path="/seller/rfqs"
  element={
    <PrivateRoute role="SELLER">
      <SellerRfqsPage />
    </PrivateRoute>
  }
/>
        <Route
  path="/logistics/shipping"
  element={
    <PrivateRoute role="LOGISTICS">
      <LogisticsShippingPage />
    </PrivateRoute>
  }
/>
        <Route
  path="/admin/dashboard"
  element={
    <PrivateRoute role="ADMIN">
      <AdminDashboardPage />
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
  path="/admin/companies"
  element={
    <PrivateRoute role="ADMIN">
      <AdminCompaniesPage />
    </PrivateRoute>
  }
/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}