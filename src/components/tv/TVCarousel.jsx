import { useEffect, useState } from 'react'
import TVSlide from './TVSlide.jsx'

export default function TVCarousel({ ofertas, tempoExibicao, modoTransicao, exibirPrecoAntigo, exibirCategoria }) {
  const [index, setIndex] = useState(0)

  // Garante que o índice nunca fique fora dos limites quando a lista de ofertas mudar
  useEffect(() => {
    if (index >= ofertas.length) setIndex(0)
  }, [ofertas.length, index])

  useEffect(() => {
    if (ofertas.length <= 1) return
    const segundos = Math.min(60, Math.max(3, tempoExibicao || 6))
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % ofertas.length)
    }, segundos * 1000)
    return () => clearInterval(timer)
  }, [ofertas.length, tempoExibicao])

  if (ofertas.length === 0) return null

  const ofertaAtual = ofertas[index] ?? ofertas[0]
  const animClass = modoTransicao === 'slide' ? 'tv-anim-slide' : 'tv-anim-fade'

  return (
    <div className="absolute inset-0">
      <div key={ofertaAtual.id} className={`absolute inset-0 ${animClass}`}>
        <TVSlide oferta={ofertaAtual} exibirPrecoAntigo={exibirPrecoAntigo} exibirCategoria={exibirCategoria} />
      </div>

      {ofertas.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {ofertas.map((o, i) => (
            <span
              key={o.id}
              className={`h-2 rounded-full transition-all ${
                i === index ? 'w-8 bg-bakery-brown-700' : 'w-2 bg-bakery-brown-300/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
