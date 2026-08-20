import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import ImageUpload from '../../components/admin/ImageUpload.jsx'
import { useConfiguracoes } from '../../hooks/useConfiguracoes'
import { useToast } from '../../context/ToastContext.jsx'

const inputClass =
  'w-full rounded-xl border border-bakery-brown-100 px-4 py-2.5 text-bakery-brown-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-bakery-gold focus:border-transparent'
const labelClass = 'block text-sm font-semibold text-bakery-brown-700 mb-1.5'

export default function Configuracoes() {
  const { config, loading, salvarConfiguracoes } = useConfiguracoes()
  const toast = useToast()

  const [form, setForm] = useState(config)
  const [logo, setLogo] = useState(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    setForm(config)
    setLogo(config.logo_url ? { url: config.logo_url, path: config.logo_path ?? null } : null)
  }, [config])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await salvarConfiguracoes({ ...form, logo_url: logo?.url ?? null, logo_path: logo?.path ?? null })
      toast.success('Configurações salvas! A TV será atualizada automaticamente.')
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível salvar as configurações.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-bakery-brown-300 text-sm">Carregando configurações...</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl font-bold text-bakery-brown-900 mb-6">Configurações da TV</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-bakery-brown-50 shadow-sm p-6 max-w-2xl space-y-5">
        <div>
          <label className={labelClass}>Nome da padaria</label>
          <input
            className={inputClass}
            value={form.nome_padaria ?? ''}
            onChange={(e) => update('nome_padaria', e.target.value)}
            maxLength={40}
          />
        </div>

        <div>
          <label className={labelClass}>Logo (opcional)</label>
          <ImageUpload value={logo} onChange={setLogo} />
        </div>

        <div>
          <label className={labelClass}>Mensagem de rodapé</label>
          <input
            className={inputClass}
            value={form.mensagem_rodape ?? ''}
            onChange={(e) => update('mensagem_rodape', e.target.value)}
            maxLength={120}
            placeholder="Ofertas válidas enquanto durarem os estoques."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tempo de cada oferta (segundos)</label>
            <input
              type="number"
              min={3}
              max={60}
              className={inputClass}
              value={form.tempo_exibicao ?? 6}
              onChange={(e) => update('tempo_exibicao', Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelClass}>Modo de transição</label>
            <select
              className={inputClass}
              value={form.modo_transicao ?? 'fade'}
              onChange={(e) => update('modo_transicao', e.target.value)}
            >
              <option value="fade">Fade (esmaecer)</option>
              <option value="slide">Slide (deslizar)</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.exibir_preco_antigo ?? true}
              onChange={(e) => update('exibir_preco_antigo', e.target.checked)}
              className="w-5 h-5 rounded accent-bakery-brown-700"
            />
            <span className="text-sm font-semibold text-bakery-brown-700">Exibir preço antigo riscado</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={form.exibir_categoria ?? true}
              onChange={(e) => update('exibir_categoria', e.target.checked)}
              className="w-5 h-5 rounded accent-bakery-brown-700"
            />
            <span className="text-sm font-semibold text-bakery-brown-700">Exibir categoria na TV</span>
          </label>
        </div>

        <div className="pt-2">
          <Button type="submit" icon={Save} loading={salvando}>
            Salvar configurações
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
