import { STATUS_INFO } from '../../utils/ofertaStatus'

export default function StatusBadge({ status }) {
  const info = STATUS_INFO[status]
  if (!info) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${info.className}`}
    >
      <span>{info.emoji}</span>
      {info.label}
    </span>
  )
}
