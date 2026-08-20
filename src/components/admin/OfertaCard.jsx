import { ArrowDown, ArrowUp, Croissant, Pencil, Power, Trash2 } from 'lucide-react'
import StatusBadge from '../ui/StatusBadge.jsx'
import { formatCurrency, formatDateBR } from '../../utils/format'
import { getOfertaStatus } from '../../utils/ofertaStatus'

export default function OfertaCard({
  oferta,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onToggleAtiva,
  onMoveUp,
  onMoveDown,
}) {
  const status = getOfertaStatus(oferta)

  return (
    <div className="bg-white rounded-2xl border border-bakery-brown-50 shadow-sm overflow-hidden flex flex-col sm:flex-row">
      <div className="w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-bakery-brown-50 flex items-center justify-center">
        {oferta.imagem_url ? (
          <img src={oferta.imagem_url} alt={oferta.nome} className="w-full h-full object-cover" />
        ) : (
          <Croissant className="text-bakery-brown-300" size={40} />
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-bakery-brown-900 truncate">{oferta.nome}</h3>
            {oferta.categoria && <p className="text-xs text-bakery-brown-300">{oferta.categoria}</p>}
          </div>
          <StatusBadge status={status} />
        </div>

        {oferta.descricao && <p className="text-sm text-gray-600 line-clamp-2">{oferta.descricao}</p>}

        <div className="flex items-baseline gap-2">
          {oferta.preco_promocional ? (
            <>
              <span className="text-sm text-gray-400 line-through">{formatCurrency(oferta.preco)}</span>
              <span className="text-lg font-extrabold text-bakery-promo">
                {formatCurrency(oferta.preco_promocional)}
              </span>
            </>
          ) : (
            <span className="text-lg font-extrabold text-bakery-brown-900">{formatCurrency(oferta.preco)}</span>
          )}
        </div>

        <p className="text-xs text-bakery-brown-300">
          {formatDateBR(oferta.data_inicio)} até {formatDateBR(oferta.data_fim)}
        </p>

        <div className="mt-auto pt-2 flex flex-wrap items-center gap-2">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-2 rounded-lg border border-bakery-brown-100 text-bakery-brown-700 hover:bg-bakery-brown-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Mover para cima"
            title="Mover para cima"
          >
            <ArrowUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-2 rounded-lg border border-bakery-brown-100 text-bakery-brown-700 hover:bg-bakery-brown-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Mover para baixo"
            title="Mover para baixo"
          >
            <ArrowDown size={16} />
          </button>

          <div className="flex-1" />

          <button
            onClick={onToggleAtiva}
            className="p-2 rounded-lg border border-bakery-brown-100 text-bakery-brown-700 hover:bg-bakery-brown-50"
            aria-label={oferta.ativa ? 'Desativar oferta' : 'Reativar oferta'}
            title={oferta.ativa ? 'Desativar' : 'Reativar'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg border border-bakery-brown-100 text-bakery-brown-700 hover:bg-bakery-brown-50"
            aria-label="Editar oferta"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
            aria-label="Excluir oferta"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
