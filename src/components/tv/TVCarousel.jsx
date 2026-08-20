import { useEffect, useRef, useState } from 'react'
import TVSlide from './TVSlide.jsx'
import MidiaSlide from './MidiaSlide.jsx'

const TEMPO_MAXIMO_VIDEO_MS = 45_000 // rede de segurança caso o evento "onEnded" do vídeo não dispare

export default function TVCarousel({ itens, tempoExibicao, modoTransicao, exibirPrecoAntigo, exibirCategoria }) {
  const [index, setIndex] = useState(0)
  const videoSafetyTimer = useRef(null)

  useEffect(() => {
    if (index >= itens.length) setIndex(0)
  }, [itens.length, index])

  const itemAtual = itens[index] ?? itens[0]

  function avancar() {
    setIndex((i) => (i + 1) % itens.length)
  }

  // Ofertas e fotos avançam por tempo; vídeos avançam quando terminam de tocar
  // (com um teto de segurança, caso o evento onEnded não dispare por algum motivo).
  useEffect(() => {
    if (!itemAtual || itens.length <= 1) return

    if (itemAtual.kind === 'video') {
      videoSafetyTimer.current = setTimeout(avancar, TEMPO_MAXIMO_VIDEO_MS)
      return () => clearTimeout(videoSafetyTimer.current)
    }

    const segundos = Math.min(60, Math.max(3, tempoExibicao || 6))
    const timer = setTimeout(avancar, segundos * 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, itens.length, tempoExibicao, itemAtual?.kind])

  if (!itens || itens.length === 0) return null

  function handleVideoEnded() {
    clearTimeout(videoSafetyTimer.current)
    avancar()
  }

  const animClass = modoTransicao === 'slide' ? 'tv-anim-slide' : 'tv-anim-fade'

  return (
    <div className="absolute inset-0">
      <div key={`${itemAtual.kind}-${itemAtual.data.id}`} className={`absolute inset-0 ${animClass}`}>
        {itemAtual.kind === 'oferta' ? (
          <TVSlide oferta={itemAtual.data} exibirPrecoAntigo={exibirPrecoAntigo} exibirCategoria={exibirCategoria} />
        ) : (
          <MidiaSlide midia={itemAtual.data} onVideoEnded={handleVideoEnded} />
        )}
      </div>

      {itens.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {itens.map((it, i) => (
            <span
              key={`${it.kind}-${it.data.id}`}
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
