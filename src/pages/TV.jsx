import { useMemo, useState } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import TVCarousel from '../components/tv/TVCarousel.jsx'
import ConnectionIndicator from '../components/tv/ConnectionIndicator.jsx'
import { useOfertas } from '../hooks/useOfertas'
import { useMidias } from '../hooks/useMidias'
import { useConfiguracoes } from '../hooks/useConfiguracoes'
import { isOfertaVisivelAgora } from '../utils/ofertaStatus'

export default function TV() {
  const { ofertas, online } = useOfertas({ somenteAtivas: true })
  const { midias } = useMidias({ somenteAtivas: true })
  const { config } = useConfiguracoes()
  const [emTelaCheia, setEmTelaCheia] = useState(false)

  // Ofertas dentro do período de validade, seguidas das fotos/vídeos institucionais -
  // tudo entra na mesma rotação da TV, cada tipo respeitando sua própria ordem.
  const itensCarrossel = useMemo(() => {
    const ofertasItems = ofertas
      .filter(isOfertaVisivelAgora)
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((oferta) => ({ kind: 'oferta', data: oferta }))

    const midiasItems = [...midias]
      .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      .map((midia) => ({ kind: midia.tipo, data: midia }))

    return [...ofertasItems, ...midiasItems]
  }, [ofertas, midias])

  async function alternarTelaCheia() {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setEmTelaCheia(true)
      } else {
        await document.exitFullscreen()
        setEmTelaCheia(false)
      }
    } catch {
      // Alguns navegadores de Smart TV não suportam a Fullscreen API - tudo bem,
      // a página já ocupa 100% da tela por padrão.
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden select-none bg-bakery-cream">
      <header className="absolute top-0 left-0 z-20 flex items-center gap-3 px-8 py-6">
        {config.logo_url && (
          <img src={config.logo_url} alt={config.nome_padaria} className="h-14 w-14 rounded-full object-cover shadow" />
        )}
        <span className="font-display text-3xl font-bold text-bakery-brown-900 drop-shadow-sm">
          {config.nome_padaria}
        </span>
      </header>

      <button
        onClick={alternarTelaCheia}
        className="absolute top-6 right-6 z-20 rounded-full bg-black/20 hover:bg-black/40 text-white p-3 transition-colors"
        aria-label="Alternar tela cheia"
      >
        {emTelaCheia ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>

      <ConnectionIndicator online={online} />

      {itensCarrossel.length > 0 ? (
        <TVCarousel
          itens={itensCarrossel}
          tempoExibicao={config.tempo_exibicao}
          modoTransicao={config.modo_transicao}
          exibirPrecoAntigo={config.exibir_preco_antigo}
          exibirCategoria={config.exibir_categoria}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-8">
          <span className="text-7xl">🥐</span>
          <p className="font-display text-4xl font-bold text-bakery-brown-900">
            Nenhuma oferta ativa no momento
          </p>
          <p className="text-xl text-bakery-brown-500">
            Cadastre uma oferta, foto ou vídeo no painel administrativo para exibir aqui.
          </p>
        </div>
      )}

      {config.mensagem_rodape && (
        <footer className="absolute bottom-0 left-0 right-0 z-20 bg-bakery-brown-900/90 text-bakery-cream text-center text-lg lg:text-xl font-medium py-3 px-6">
          {config.mensagem_rodape}
        </footer>
      )}
    </div>
  )
}
