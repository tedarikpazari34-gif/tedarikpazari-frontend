import { sectors } from "../data/sectors";

export default function PopularSectors() {
  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-4">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Kategoriler</p>
            <h2 className="text-2xl font-bold text-white">
              Popüler tedarik alanları
            </h2>
          </div>

          <a
            href="/kategori"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Tüm kategorileri incele
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {sectors.map((sector) => (
            <div
              key={sector.id}
              className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition"
            >
              {/* ICON yerine ilk harf */}
              <div className="text-blue-400 text-xl mb-2">
                {sector.name.charAt(0)}
              </div>

              <div className="text-white font-semibold text-sm">
                {sector.name}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}