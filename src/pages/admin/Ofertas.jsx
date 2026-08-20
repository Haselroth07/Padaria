import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import OfertaCard from '../../components/admin/OfertaCard.jsx'
import OfertaFormModal from '../../components/admin/OfertaFormModal.jsx'
import SearchFilterBar from '../../components/admin/SearchFilterBar.jsx'
import { useOfertas } from '../../hooks/useOfertas'
import { useToast } from '../../context/ToastContext.jsx'
import { supabase, OFERTAS_BUCKET } from '../../lib/supabaseClient'

export default function Ofertas() {
  const { ofertas, loading, refetch } = useOfertas({ somenteAtivas: false })
  const toast = useToast()

  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [ofertaEditando, setOfertaEditando] = useState(null)
  const [ofertaExcluindo, setOfertaExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  const categorias = useMemo(
    () => [...new Set(ofertas.map((o) => o.categoria).filter(Boolean))].sort(),
    [ofertas],
  )

  const ofertasFiltradas = useMemo(() => {
    return [...ofertas]
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .filter((o) => o.nome.toLowerCase().includes(busca.trim().toLowerCase()))
      .filter((o) => !categoriaFiltro || o.categoria === categoriaFiltro)
  }, [ofertas, busca, categoriaFiltro])

  function abrirNovaOferta() {
    setOfertaEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(oferta) {
    setOfertaEditando(oferta)
    setModalAberto(true)
  }

  async function handleSalvar(dados) {
    if (ofertaEditando) {
      const { error } = await supabase.from('ofertas').update(dados).eq('id', ofertaEditando.id)
      if (error) throw error
      toast.success('Oferta atualizada com sucesso!')
    } else {
      const proximaOrdem = ofertas.length > 0 ? Math.max(...ofertas.map((o) => o.ordem ?? 0)) + 1 : 1
      const { error } = await supabase.from('ofertas').insert({ ...dados, ordem: proximaOrdem })
      if (error) throw error
      toast.success('Oferta cadastrada com sucesso!')
    }
    refetch()
  }

  async function handleToggleAtiva(oferta) {
    const { error } = await supabase.from('ofertas').update({ ativa: !oferta.ativa }).eq('id', oferta.id)
    if (error) {
      toast.error('Não foi possível atualizar a oferta.')
      return
    }
    toast.success(oferta.ativa ? 'Oferta desativada.' : 'Oferta reativada.')
    refetch()
  }

  async function confirmarExclusao() {
    if (!ofertaExcluindo) return
    setExcluindo(true)
    try {
      if (ofertaExcluindo.imagem_path) {
        await supabase.storage.from(OFERTAS_BUCKET).remove([ofertaExcluindo.imagem_path])
      }
      const { error } = await supabase.from('ofertas').delete().eq('id', ofertaExcluindo.id)
      if (error) throw error
      toast.success('Oferta excluída.')
      setOfertaExcluindo(null)
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível excluir a oferta.')
    } finally {
      setExcluindo(false)
    }
  }

  async function moverOferta(oferta, direcao) {
    const ordenadas = [...ofertas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    const index = ordenadas.findIndex((o) => o.id === oferta.id)
    const alvo = direcao === 'up' ? ordenadas[index - 1] : ordenadas[index + 1]
    if (!alvo) return

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('ofertas').update({ ordem: alvo.ordem }).eq('id', oferta.id),
      supabase.from('ofertas').update({ ordem: oferta.ordem }).eq('id', alvo.id),
    ])
    if (e1 || e2) {
      toast.error('Não foi possível reordenar as ofertas.')
      return
    }
    refetch()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold text-bakery-brown-900">Ofertas</h1>
        <Button icon={Plus} onClick={abrirNovaOferta}>
          Nova oferta
        </Button>
      </div>

      <div className="mb-5">
        <SearchFilterBar
          busca={busca}
          onBuscaChange={setBusca}
          categoria={categoriaFiltro}
          onCategoriaChange={setCategoriaFiltro}
          categorias={categorias}
        />
      </div>

      {loading ? (
        <p className="text-bakery-brown-300 text-sm">Carregando ofertas...</p>
      ) : ofertasFiltradas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-bakery-brown-100 p-10 text-center">
          <p className="text-bakery-brown-300">
            {ofertas.length === 0
              ? 'Nenhuma oferta cadastrada ainda. Clique em "Nova oferta" para começar.'
              : 'Nenhuma oferta encontrada com esses filtros.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ofertasFiltradas.map((oferta, i) => (
            <OfertaCard
              key={oferta.id}
              oferta={oferta}
              isFirst={i === 0}
              isLast={i === ofertasFiltradas.length - 1}
              onEdit={() => abrirEdicao(oferta)}
              onDelete={() => setOfertaExcluindo(oferta)}
              onToggleAtiva={() => handleToggleAtiva(oferta)}
              onMoveUp={() => moverOferta(oferta, 'up')}
              onMoveDown={() => moverOferta(oferta, 'down')}
            />
          ))}
        </div>
      )}

      <OfertaFormModal
        open={modalAberto}
        oferta={ofertaEditando}
        categoriasExistentes={categorias}
        onClose={() => setModalAberto(false)}
        onSave={handleSalvar}
      />

      <ConfirmDialog
        open={!!ofertaExcluindo}
        danger
        title="Excluir oferta?"
        message={`Tem certeza que deseja excluir "${ofertaExcluindo?.nome}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onCancel={() => setOfertaExcluindo(null)}
      />
    </AdminLayout>
  )
}
