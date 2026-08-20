import { Search } from 'lucide-react'

export default function SearchFilterBar({ busca, onBuscaChange, categoria, onCategoriaChange, categorias }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bakery-brown-300" size={18} />
        <input
          value={busca}
          onChange={(e) => onBuscaChange(e.target.value)}
          placeholder="Buscar produto pelo nome..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-bakery-brown-100 focus:outline-none focus:ring-2 focus:ring-bakery-gold"
        />
      </div>
      <select
        value={categoria}
        onChange={(e) => onCategoriaChange(e.target.value)}
        className="rounded-xl border border-bakery-brown-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-bakery-gold sm:w-56"
      >
        <option value="">Todas as categorias</option>
        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  )
}
