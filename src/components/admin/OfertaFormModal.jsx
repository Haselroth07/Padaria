import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from '../ui/Button.jsx'
import ImageUpload from './ImageUpload.jsx'
import { todayISODate } from '../../utils/format'

const VAZIO = {
  nome: '',
  descricao: '',
  preco: '',
  preco_promocional: '',
  categoria: '',
  data_inicio: todayISODate(),
  data_fim: '',
  ativa: true,
}

const inputClass =
  'w-full rounded-xl border border-bakery-brown-100 px-4 py-2.5 text-bakery-brown-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-bakery-gold focus:border-transparent'
const labelClass = 'block text-sm font-semibold text-bakery-brown-700 mb-1.5'

export default function OfertaFormModal({ open, oferta, categoriasExistentes = [], onClose, onSave }) {
  const [form, setForm] = useState(VAZIO)
  const [imagem, setImagem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!open) return
    if (oferta) {
      setForm({
        nome: oferta.nome ?? '',
        descricao: oferta.descricao ?? '',
        preco: oferta.preco ?? '',
        preco_promocional: oferta.preco_promocional ?? '',
        categoria: oferta.categoria ?? '',
        data_inicio: oferta.data_inicio ?? todayISODate(),
        data_fim: oferta.data_fim ?? '',
        ativa: oferta.ativa ?? true,
      })
      setImagem(oferta.imagem_url ? { url: oferta.imagem_url, path: oferta.imagem_path } : null)
    } else {
      setForm(VAZIO)
      setImagem(null)
    }
    setErro('')
  }, [open, oferta])

  if (!open) return null

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) {
      setErro('Informe o nome do produto.')
      return
    }
    if (!form.preco || Number(form.preco) < 0) {
      setErro('Informe um preço válido.')
      return
    }
    if (
      form.preco_promocional !== '' &&
      form.preco_promocional !== null &&
      Number(form.preco_promocional) >= Number(form.preco)
    ) {
      setErro('O preço promocional deve ser menor que o preço normal.')
      return
    }
    if (!form.data_fim) {
      setErro('Informe a data de término da promoção.')
      return
    }
    if (form.data_fim < form.data_inicio) {
      setErro('A data de término não pode ser antes da data de início.')
      return
    }

    setSaving(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        preco: Number(form.preco),
        preco_promocional: form.preco_promocional === '' ? null : Number(form.preco_promocional),
        categoria: form.categoria.trim() || null,
        data_inicio: form.data_inicio,
        data_fim: form.data_fim,
        ativa: form.ativa,
        imagem_url: imagem?.url ?? null,
        imagem_path: imagem?.path ?? null,
      })
      onClose()
    } catch (err) {
      console.error(err)
      setErro('Não foi possível salvar a oferta. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto scrollbar-thin rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-bakery-brown-50">
          <h2 className="text-xl font-bold text-bakery-brown-900 font-display">
            {oferta ? 'Editar oferta' : 'Nova oferta'}
          </h2>
          <button
            onClick={onClose}
            className="text-bakery-brown-300 hover:text-bakery-brown-700"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass}>Foto do produto</label>
            <ImageUpload value={imagem} onChange={setImagem} />
          </div>

          <div>
            <label className={labelClass}>Nome do produto *</label>
            <input
              className={inputClass}
              value={form.nome}
              onChange={(e) => updateField('nome', e.target.value)}
              placeholder="Ex: Pão de queijo"
              maxLength={80}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Descrição (opcional)</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.descricao}
              onChange={(e) => updateField('descricao', e.target.value)}
              placeholder="Ex: Pão de queijo quentinho, feito na hora"
              maxLength={160}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Preço normal (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                value={form.preco}
                onChange={(e) => updateField('preco', e.target.value)}
                placeholder="8.90"
              />
            </div>
            <div>
              <label className={labelClass}>Preço promocional (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={inputClass}
                value={form.preco_promocional}
                onChange={(e) => updateField('preco_promocional', e.target.value)}
                placeholder="6.90"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Categoria</label>
            <input
              list="categorias-existentes"
              className={inputClass}
              value={form.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              placeholder="Ex: Salgados, Doces, Bebidas..."
            />
            <datalist id="categorias-existentes">
              {categoriasExistentes.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Início da promoção *</label>
              <input
                type="date"
                className={inputClass}
                value={form.data_inicio}
                onChange={(e) => updateField('data_inicio', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Fim da promoção *</label>
              <input
                type="date"
                className={inputClass}
                value={form.data_fim}
                onChange={(e) => updateField('data_fim', e.target.value)}
                min={form.data_inicio}
              />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.ativa}
              onChange={(e) => updateField('ativa', e.target.checked)}
              className="w-5 h-5 rounded accent-bakery-brown-700"
            />
            <span className="text-sm font-semibold text-bakery-brown-700">Oferta ativa</span>
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
