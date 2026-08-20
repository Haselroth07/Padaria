import { parseISODate } from './format'

export const STATUS = {
  ATIVA: 'ativa',
  AGENDADA: 'agendada',
  EXPIRADA: 'expirada',
  INATIVA: 'inativa',
}

export const STATUS_INFO = {
  [STATUS.ATIVA]: { label: 'Ativa', emoji: '🟢', className: 'bg-green-100 text-green-800' },
  [STATUS.AGENDADA]: { label: 'Agendada', emoji: '🟡', className: 'bg-amber-100 text-amber-800' },
  [STATUS.EXPIRADA]: { label: 'Expirada', emoji: '🔴', className: 'bg-red-100 text-red-800' },
  [STATUS.INATIVA]: { label: 'Inativa', emoji: '⚪', className: 'bg-gray-100 text-gray-600' },
}

/**
 * Calcula o status "real" de uma oferta com base na flag `ativa`
 * e nas datas de início/fim, comparado com a data de hoje.
 */
export function getOfertaStatus(oferta) {
  if (!oferta.ativa) return STATUS.INATIVA

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const inicio = parseISODate(oferta.data_inicio)
  const fim = parseISODate(oferta.data_fim)

  if (inicio && hoje < inicio) return STATUS.AGENDADA
  if (fim && hoje > fim) return STATUS.EXPIRADA
  return STATUS.ATIVA
}

/** Verdadeiro apenas quando a oferta deve aparecer na TV agora. */
export function isOfertaVisivelAgora(oferta) {
  return getOfertaStatus(oferta) === STATUS.ATIVA
}
