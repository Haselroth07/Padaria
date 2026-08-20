import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const DEFAULTS = {
  id: 1,
  nome_padaria: 'Minha Padaria',
  logo_url: null,
  logo_path: null,
  mensagem_rodape: 'Ofertas válidas enquanto durarem os estoques.',
  tempo_exibicao: 6,
  modo_transicao: 'fade',
  exibir_preco_antigo: true,
  exibir_categoria: true,
}

export function useConfiguracoes() {
  const [config, setConfig] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)

  const fetchConfig = useCallback(async () => {
    const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).maybeSingle()

    if (error) {
      console.error('[useConfiguracoes] Falha ao buscar configurações:', error.message)
      return
    }
    if (data) {
      setConfig(data)
      try {
        localStorage.setItem('panificadora:config-cache', JSON.stringify(data))
      } catch {
        // não crítico
      }
    }
  }, [])

  useEffect(() => {
    try {
      const cached = localStorage.getItem('panificadora:config-cache')
      if (cached) setConfig(JSON.parse(cached))
    } catch {
      // ignora
    }

    setLoading(true)
    fetchConfig().finally(() => setLoading(false))

    const channel = supabase
      .channel('configuracoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, () => {
        fetchConfig()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConfig])

  async function salvarConfiguracoes(mudancas) {
    const { data, error } = await supabase
      .from('configuracoes')
      .upsert({ id: 1, ...config, ...mudancas })
      .select()
      .single()

    if (error) throw error
    setConfig(data)
    return data
  }

  return { config, loading, salvarConfiguracoes, refetch: fetchConfig }
}
