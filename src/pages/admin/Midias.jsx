import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'
import MidiaCard from '../../components/admin/MidiaCard.jsx'
import MidiaFormModal from '../../components/admin/MidiaFormModal.jsx'
import { useMidias } from '../../hooks/useMidias'
import { useToast } from '../../context/ToastContext.jsx'
import { supabase } from '../../lib/supabaseClient'

const BUCKET = 'midias-panificadora'

export default function Midias() {
  const { midias, loading, refetch } = useMidias({ somenteAtivas: false })
  const toast = useToast()

  const [modalAberto, setModalAberto] = useState(false)
  const [midiaEditando, setMidiaEditando] = useState(null)
  const [midiaExcluindo, setMidiaExcluindo] = useState(null)
  const [excluindo, setExcluindo] = useState(false)

  const midiasOrdenadas = useMemo(() => [...midias].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)), [midias])

  function abrirNova() {
    setMidiaEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(midia) {
    setMidiaEditando(midia)
    setModalAberto(true)
  }

  async function handleSalvar(dados) {
    if (midiaEditando) {
      const { error } = await supabase.from('midias').update(dados).eq('id', midiaEditando.id)
      if (error) throw error
      toast.success('Mídia atualizada com sucesso!')
    } else {
      const proximaOrdem = midias.length > 0 ? Math.max(...midias.map((m) => m.ordem ?? 0)) + 1 : 1
      const { error } = await supabase.from('midias').insert({ ...dados, ordem: proximaOrdem })
      if (error) throw error
      toast.success('Mídia cadastrada com sucesso!')
    }
    refetch()
  }

  async function handleToggleAtiva(midia) {
    const { error } = await supabase.from('midias').update({ ativa: !midia.ativa }).eq('id', midia.id)
    if (error) {
      toast.error('Não foi possível atualizar.')
      return
    }
    toast.success(midia.ativa ? 'Removida da TV.' : 'Adicionada de volta à TV.')
    refetch()
  }

  async function confirmarExclusao() {
    if (!midiaExcluindo) return
    setExcluindo(true)
    try {
      if (midiaExcluindo.path) {
        await supabase.storage.from(BUCKET).remove([midiaExcluindo.path])
      }
      const { error } = await supabase.from('midias').delete().eq('id', midiaExcluindo.id)
      if (error) throw error
      toast.success('Mídia excluída.')
      setMidiaExcluindo(null)
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível excluir.')
    } finally {
      setExcluindo(false)
    }
  }

  async function mover(midia, direcao) {
    const index = midiasOrdenadas.findIndex((m) => m.id === midia.id)
    const alvo = direcao === 'up' ? midiasOrdenadas[index - 1] : midiasOrdenadas[index + 1]
    if (!alvo) return

    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('midias').update({ ordem: alvo.ordem }).eq('id', midia.id),
      supabase.from('midias').update({ ordem: midia.ordem }).eq('id', alvo.id),
    ])
    if (e1 || e2) {
      toast.error('Não foi possível reordenar.')
      return
    }
    refetch()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-3xl font-bold text-bakery-brown-900">Fotos e vídeos</h1>
        <Button icon={Plus} onClick={abrirNova}>
          Nova mídia
        </Button>
      </div>
      <p className="text-sm text-bakery-brown-300 mb-6">
        Esse conteúdo aparece na TV junto com as ofertas, na sequência da lista abaixo.
      </p>

      {loading ? (
        <p className="text-bakery-brown-300 text-sm">Carregando...</p>
      ) : midiasOrdenadas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-bakery-brown-100 p-10 text-center">
          <p className="text-bakery-brown-300">
            Nenhuma foto ou vídeo cadastrado ainda. Clique em "Nova mídia" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {midiasOrdenadas.map((midia, i) => (
            <MidiaCard
              key={midia.id}
              midia={midia}
              isFirst={i === 0}
              isLast={i === midiasOrdenadas.length - 1}
              onEdit={() => abrirEdicao(midia)}
              onDelete={() => setMidiaExcluindo(midia)}
              onToggleAtiva={() => handleToggleAtiva(midia)}
              onMoveUp={() => mover(midia, 'up')}
              onMoveDown={() => mover(midia, 'down')}
            />
          ))}
        </div>
      )}

      <MidiaFormModal open={modalAberto} midia={midiaEditando} onClose={() => setModalAberto(false)} onSave={handleSalvar} />

      <ConfirmDialog
        open={!!midiaExcluindo}
        danger
        title="Excluir mídia?"
        message="Tem certeza que deseja excluir esse arquivo? Essa ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={confirmarExclusao}
        onCancel={() => setMidiaExcluindo(null)}
      />
    </AdminLayout>
  )
}
