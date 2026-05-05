import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-700">
          TEDARİKÇİ
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-blue-600">
            Ana Sayfa
          </Link>

          <Link to="/tekliflerim" className="hover:text-blue-600">
            Tekliflerim
          </Link>

          <Link to="/buyer/orders" className="hover:text-blue-600">
            Siparişlerim
          </Link>

          <Link to="/seller/rfqs" className="hover:text-blue-600">
            Gelen Talepler
          </Link>

          <Link to="/seller/orders" className="hover:text-blue-600">
            Seller Siparişleri
          </Link>
        </nav>
      </div>
    </header>
  );
}