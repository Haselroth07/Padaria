import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { LayoutDashboard, ListOrdered, LogOut, Menu, Settings, Tv, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/ofertas', label: 'Ofertas', icon: ListOrdered },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminLayout({ children }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [menuAberto, setMenuAberto] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
      isActive
        ? 'bg-bakery-brown-700 text-white'
        : 'text-bakery-brown-700 hover:bg-bakery-brown-50'
    }`

  const SidebarContent = (
    <>
      <div className="px-4 py-5">
        <p className="font-display text-2xl font-bold text-bakery-brown-900">🥖 Painel</p>
        <p className="text-xs text-bakery-brown-300 truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass} onClick={() => setMenuAberto(false)}>
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
        <a
          href="/tv"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-bakery-brown-700 hover:bg-bakery-brown-50"
        >
          <Tv size={18} />
          Abrir tela da TV
        </a>
      </nav>
      <div className="p-3">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-bakery-cream flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-bakery-brown-50 bg-white">
        {SidebarContent}
      </aside>

      {/* Sidebar mobile (drawer) */}
      {menuAberto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuAberto(false)} />
          <aside className="relative flex flex-col w-64 bg-white h-full shadow-xl">
            <button
              onClick={() => setMenuAberto(false)}
              className="absolute top-4 right-4 text-bakery-brown-400"
              aria-label="Fechar menu"
            >
              <X size={22} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-bakery-brown-50">
          <p className="font-display text-xl font-bold text-bakery-brown-900">🥖 Painel</p>
          <button onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
            <Menu className="text-bakery-brown-700" size={24} />
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
