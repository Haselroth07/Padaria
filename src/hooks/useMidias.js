import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * @param {object} options
 * @param {boolean} options.somenteAtivas - true para a TV (só mídias ativas), false para o admin (todas)
 */
export function useMidias({ somenteAtivas = false } = {}) {
  const [midias, setMidias] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMidias = useCallback(async () => {
    let query = supabase.from('midias').select('*').order('ordem', { ascending: true })
    if (somenteAtivas) {
      query = query.eq('ativa', true)
    }
    const { data, error } = await query
    if (error) {
      console.error('[useMidias] Falha ao buscar mídias:', error.message)
      return
    }
    setMidias(data ?? [])
    if (somenteAtivas) {
      try {
        localStorage.setItem('panificadora:midias-cache', JSON.stringify(data ?? []))
      } catch {
        // não crítico
      }
    }
  }, [somenteAtivas])

  useEffect(() => {
    if (!somenteAtivas) return
    try {
      const cached = localStorage.getItem('panificadora:midias-cache')
      if (cached) setMidias(JSON.parse(cached))
    } catch {
      // ignora
    }
  }, [somenteAtivas])

  useEffect(() => {
    setLoading(true)
    fetchMidias().finally(() => setLoading(false))

    const channel = supabase
      .channel('midias-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'midias' }, () => {
        fetchMidias()
      })
      .subscribe()

    function handleOnline() {
      fetchMidias()
    }
    window.addEventListener('online', handleOnline)
    const interval = setInterval(fetchMidias, 60_000)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      clearInterval(interval)
    }
  }, [fetchMidias])

  return { midias, loading, refetch: fetchMidias }
}
