import { sectors } from "../data/sectors";

export default function PopularSectors() {
  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Kategoriler</p>
            <h2 className="text-3xl font-bold text-white">Popüler tedarik alanları</h2>
          </div>

          <a
            href="/kategori"
            className="text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Tüm kategorileri incele
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {sectors.map((sector) => (
            <a
              key={sector.id}
              href={`/kategori/${sector.slug}`}
              className="rounded-2xl border border-white/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                {sector.iconLetter}
              </div>

              <h3 className="mb-2 text-base font-semibold text-gray-900">
                {sector.name}
              </h3>

              <p className="text-sm leading-5 text-gray-500">
                {sector.shortDescription}
              </p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}