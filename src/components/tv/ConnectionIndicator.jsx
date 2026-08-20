import { WifiOff } from 'lucide-react'

export default function ConnectionIndicator({ online }) {
  if (online) return null

  return (
    <div className="absolute top-24 right-6 z-20 flex items-center gap-2 rounded-full bg-black/70 text-white text-sm font-semibold px-4 py-2">
      <WifiOff size={16} className="animate-pulse-dot" />
      Sem conexão · exibindo últimas ofertas salvas
    </div>
  )
}
