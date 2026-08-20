import { ArrowDown, ArrowUp, Pencil, Power, Trash2, Video } from 'lucide-react'

export default function MidiaCard({ midia, isFirst, isLast, onEdit, onDelete, onToggleAtiva, onMoveUp, onMoveDown }) {
  return (
    <div className="bg-white rounded-2xl border border-bakery-brown-50 shadow-sm overflow-hidden flex flex-col sm:flex-row">
      <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 bg-black flex items-center justify-center">
        {midia.tipo === 'video' ? (
          <>
            <video src={midia.url} className="w-full h-full object-cover" muted playsInline />
            <span className="absolute top-2 left-2 rounded-full bg-black/70 text-white p-1.5">
              <Video size={14} />
            </span>
          </>
        ) : (
          <img src={midia.url} alt={midia.titulo ?? 'Mídia'} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-bakery-brown-900 truncate">
              {midia.titulo || (midia.tipo === 'video' ? 'Vídeo sem título' : 'Foto sem título')}
            </h3>
            <p className="text-xs text-bakery-brown-300 capitalize">{midia.tipo}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
              midia.ativa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {midia.ativa ? '🟢 Ativa' : '⚪ Inativa'}
          </span>
        </div>

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
            aria-label={midia.ativa ? 'Desativar' : 'Reativar'}
            title={midia.ativa ? 'Desativar' : 'Reativar'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg border border-bakery-brown-100 text-bakery-brown-700 hover:bg-bakery-brown-50"
            aria-label="Editar"
            title="Editar"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
            aria-label="Excluir"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
