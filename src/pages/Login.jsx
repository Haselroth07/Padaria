import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'

export default function Login() {
  const { session, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  if (!loading && session) {
    const destino = location.state?.from ?? '/admin'
    return <Navigate to={destino} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEntrando(true)
    try {
      await signIn(email.trim(), senha)
      navigate('/admin', { replace: true })
    } catch (err) {
      setErro('E-mail ou senha inválidos.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="min-h-screen bg-bakery-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <p className="text-4xl">🥐</p>
          <h1 className="font-display text-2xl font-bold text-bakery-brown-900 mt-2">
            Painel da Padaria
          </h1>
          <p className="text-sm text-bakery-brown-300">Entre para gerenciar as ofertas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-bakery-brown-700 mb-1.5">E-mail</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-bakery-brown-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-bakery-gold"
              placeholder="voce@padaria.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-bakery-brown-700 mb-1.5">Senha</label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-xl border border-bakery-brown-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-bakery-gold"
              placeholder="••••••••"
            />
          </div>

          {erro && <p className="text-sm font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>}

          <Button type="submit" variant="primary" icon={LogIn} loading={entrando} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
