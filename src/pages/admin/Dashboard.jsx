import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Clock, Plus, TrendingUp, XCircle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import OfertaFormModal from '../../components/admin/OfertaFormModal.jsx'
import { useOfertas } from '../../hooks/useOfertas'
import { useToast } from '../../context/ToastContext.jsx'
import { supabase } from '../../lib/supabaseClient'
import { formatCurrency } from '../../utils/format'
import { getOfertaStatus, STATUS } from '../../utils/ofertaStatus'

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="bg-white rounded-2xl border border-bakery-brown-50 shadow-sm p-5 flex items-center gap-4">
      <div className={`rounded-xl p-3 ${tone}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-bakery-brown-900">{value}</p>
        <p className="text-sm text-bakery-brown-300">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { ofertas, loading, refetch } = useOfertas({ somenteAtivas: false })
  const [modalAberto, setModalAberto] = useState(false)
  const toast = useToast()

  const contagens = useMemo(() => {
    const c = { ativa: 0, agendada: 0, expirada: 0 }
    ofertas.forEach((o) => {
      const status = getOfertaStatus(o)
      if (status === STATUS.ATIVA) c.ativa++
      if (status === STATUS.AGENDADA) c.agendada++
      if (status === STATUS.EXPIRADA) c.expirada++
    })
    return c
  }, [ofertas])

  const ultimasOfertas = useMemo(
    () =>
      [...ofertas]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5),
    [ofertas],
  )

  async function handleCriarOferta(dados) {
    const proximaOrdem = ofertas.length > 0 ? Math.max(...ofertas.map((o) => o.ordem ?? 0)) + 1 : 1
    const { error } = await supabase.from('ofertas').insert({ ...dados, ordem: proximaOrdem })
    if (error) throw error
    toast.success('Oferta cadastrada com sucesso!')
    refetch()
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display text-3xl font-bold text-bakery-brown-900">Dashboard</h1>
        <Button icon={Plus} onClick={() => setModalAberto(true)}>
          Nova oferta
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Ofertas ativas" value={contagens.ativa} tone="bg-green-100 text-green-700" />
        <StatCard icon={Clock} label="Ofertas futuras" value={contagens.agendada} tone="bg-amber-100 text-amber-700" />
        <StatCard icon={XCircle} label="Ofertas expiradas" value={contagens.expirada} tone="bg-red-100 text-red-700" />
      </div>

      <div className="bg-white rounded-2xl border border-bakery-brown-50 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bakery-brown-50">
          <h2 className="font-bold text-bakery-brown-900">Últimas ofertas cadastradas</h2>
          <Link to="/admin/ofertas" className="text-sm font-semibold text-bakery-brown-700 hover:underline">
            Ver todas
          </Link>
        </div>

        {loading ? (
          <p className="p-5 text-sm text-bakery-brown-300">Carregando...</p>
        ) : ultimasOfertas.length === 0 ? (
          <p className="p-5 text-sm text-bakery-brown-300">Nenhuma oferta cadastrada ainda.</p>
        ) : (
          <ul className="divide-y divide-bakery-brown-50">
            {ultimasOfertas.map((oferta) => (
              <li key={oferta.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="font-semibold text-bakery-brown-900 truncate">{oferta.nome}</p>
                  <p className="text-sm text-bakery-brown-300">
                    {formatCurrency(oferta.preco_promocional || oferta.preco)}
                  </p>
                </div>
                <StatusBadge status={getOfertaStatus(oferta)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <OfertaFormModal
        open={modalAberto}
        oferta={null}
        categoriasExistentes={[...new Set(ofertas.map((o) => o.categoria).filter(Boolean))]}
        onClose={() => setModalAberto(false)}
        onSave={handleCriarOferta}
      />
    </AdminLayout>
  )
}
