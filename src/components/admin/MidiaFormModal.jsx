import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button.jsx'
import MidiaUpload from './MidiaUpload.jsx'

const inputClass =
  'w-full rounded-xl border border-bakery-brown-100 px-4 py-2.5 text-bakery-brown-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-bakery-gold focus:border-transparent'
const labelClass = 'block text-sm font-semibold text-bakery-brown-700 mb-1.5'

export default function MidiaFormModal({ open, midia, onClose, onSave }) {
  const [titulo, setTitulo] = useState('')
  const [ativa, setAtiva] = useState(true)
  const [arquivo, setArquivo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!open) return
    if (midia) {
      setTitulo(midia.titulo ?? '')
      setAtiva(midia.ativa ?? true)
      setArquivo({ url: midia.url, path: midia.path, tipo: midia.tipo })
    } else {
      setTitulo('')
      setAtiva(true)
      setArquivo(null)
    }
    setErro('')
  }, [open, midia])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!arquivo) {
      setErro('Escolha uma foto ou vídeo.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        titulo: titulo.trim() || null,
        ativa,
        url: arquivo.url,
        path: arquivo.path,
        tipo: arquivo.tipo,
      })
      onClose()
    } catch (err) {
      console.error(err)
      setErro('Não foi possível salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-bakery-brown-50">
          <h2 className="text-xl font-bold text-bakery-brown-900 font-display">
            {midia ? 'Editar mídia' : 'Nova foto ou vídeo'}
          </h2>
          <button onClick={onClose} className="text-bakery-brown-300 hover:text-bakery-brown-700" aria-label="Fechar">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Foto ou vídeo *</label>
            <MidiaUpload value={arquivo} onChange={setArquivo} />
          </div>

          <div>
            <label className={labelClass}>Título (opcional)</label>
            <input
              className={inputClass}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Nossa cozinha, Café da manhã na padaria..."
              maxLength={60}
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={ativa}
              onChange={(e) => setAtiva(e.target.checked)}
              className="w-5 h-5 rounded accent-bakery-brown-700"
            />
            <span className="text-sm font-semibold text-bakery-brown-700">Exibir na TV</span>
          </label>

          {erro && <p className="text-sm font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
