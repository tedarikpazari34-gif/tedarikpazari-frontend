import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PanelPage from "./pages/PanelPage";

function UyelikPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#0f172a",
        color: "#fff",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Üyelik sayfası yakında</h1>
        <p>Kayıt akışını hazırlıyoruz.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/panel" element={<PanelPage />} />
        <Route path="/uyelik" element={<UyelikPage />} />
      </Routes>
    </BrowserRouter>
  );
}