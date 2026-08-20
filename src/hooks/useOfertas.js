import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Busca as ofertas e mantém sincronia em tempo real via Supabase Realtime.
 *
 * @param {object} options
 * @param {boolean} options.somenteAtivas - se true, traz só ofertas com ativa = true
 *   (usado pela tela da TV; o admin usa false para ver tudo, incluindo inativas/expiradas)
 */
export function useOfertas({ somenteAtivas = false } = {}) {
  const [ofertas, setOfertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(true)
  const hasLoadedOnce = useRef(false)

  const fetchOfertas = useCallback(async () => {
    let query = supabase.from('ofertas').select('*').order('ordem', { ascending: true })
    if (somenteAtivas) {
      query = query.eq('ativa', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('[useOfertas] Falha ao buscar ofertas:', error.message)
      setOnline(false)
      return
    }

    setOnline(true)
    setOfertas(data ?? [])
    hasLoadedOnce.current = true

    try {
      localStorage.setItem('panificadora:ofertas-cache', JSON.stringify(data ?? []))
    } catch {
      // localStorage pode falhar (modo privado, TV sem suporte) - não é crítico.
    }
  }, [somenteAtivas])

  // Hidrata a partir do cache local imediatamente (evita tela em branco na TV)
  useEffect(() => {
    if (!somenteAtivas) return
    try {
      const cached = localStorage.getItem('panificadora:ofertas-cache')
      if (cached) setOfertas(JSON.parse(cached))
    } catch {
      // ignora cache corrompido
    }
  }, [somenteAtivas])

  useEffect(() => {
    setLoading(true)
    fetchOfertas().finally(() => setLoading(false))

    const channel = supabase
      .channel('ofertas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ofertas' }, () => {
        fetchOfertas()
      })
      .subscribe()

    // Rede caiu e voltou: refaz a busca (Realtime também reconecta sozinho)
    function handleOnline() {
      fetchOfertas()
    }
    window.addEventListener('online', handleOnline)

    // Rede de segurança: revalida periodicamente (também cobre virada de data)
    const interval = setInterval(fetchOfertas, 60_000)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [fetchOfertas])

  return { ofertas, loading, online, refetch: fetchOfertas }
}
