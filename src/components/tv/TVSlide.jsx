import { formatCurrency } from '../../utils/format'

export default function TVSlide({ oferta, exibirPrecoAntigo, exibirCategoria }) {
  const temPromocao = !!oferta.preco_promocional

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row bg-bakery-cream">
      {/* Foto (ou fundo decorativo quando não há foto) */}
      <div className="relative w-full lg:w-1/2 h-[45%] lg:h-full overflow-hidden">
        {oferta.imagem_url ? (
          <img src={oferta.imagem_url} alt={oferta.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bakery-brown-500 via-bakery-brown-700 to-bakery-brown-900">
            <span className="text-[10rem] leading-none drop-shadow-lg select-none">🥖</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/30 via-transparent to-transparent" />
      </div>

      {/* Informações da oferta */}
      <div className="relative flex-1 flex flex-col items-start justify-center gap-4 px-10 lg:px-16 py-8 bg-bakery-cream">
        <p className="font-display text-3xl lg:text-4xl font-semibold text-bakery-gold-dark tracking-wide">
          OFERTA DO DIA
        </p>

        {exibirCategoria && oferta.categoria && (
          <span className="rounded-full bg-bakery-brown-100 text-bakery-brown-700 text-xl lg:text-2xl font-semibold px-5 py-1.5">
            {oferta.categoria}
          </span>
        )}

        <h2 className="font-display text-5xl lg:text-7xl font-bold text-bakery-brown-900 leading-tight">
          {oferta.nome}
        </h2>

        {oferta.descricao && (
          <p className="text-2xl lg:text-3xl text-bakery-brown-700 max-w-2xl">{oferta.descricao}</p>
        )}

        <div className="mt-2 flex flex-col gap-1">
          {temPromocao && exibirPrecoAntigo && (
            <span className="text-3xl lg:text-4xl text-bakery-brown-300 line-through">
              De {formatCurrency(oferta.preco)}
            </span>
          )}
          <span className="font-display text-7xl lg:text-9xl font-extrabold text-bakery-promo leading-none drop-shadow-sm">
            {formatCurrency(temPromocao ? oferta.preco_promocional : oferta.preco)}
          </span>
        </div>

        <p className="mt-4 text-2xl lg:text-3xl font-bold text-bakery-brown-700 tracking-wide">APROVEITE! 🎉</p>
      </div>
    </div>
  )
}
