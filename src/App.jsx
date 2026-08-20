import { Navigate, Route, Routes } from 'react-router'
import Login from './pages/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Ofertas from './pages/admin/Ofertas.jsx'
import Configuracoes from './pages/admin/Configuracoes.jsx'
import TV from './pages/TV.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ofertas"
        element={
          <ProtectedRoute>
            <Ofertas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracoes"
        element={
          <ProtectedRoute>
            <Configuracoes />
          </ProtectedRoute>
        }
      />

      {/* Tela pública para a Smart TV - não exige login */}
      <Route path="/tv" element={<TV />} />

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
