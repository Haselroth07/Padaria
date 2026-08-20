import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-bakery-brown-700 hover:bg-bakery-brown-900 text-white',
  secondary: 'bg-bakery-gold hover:bg-bakery-gold-dark text-bakery-brown-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-bakery-brown-50 text-bakery-brown-700 border border-bakery-brown-100',
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : Icon ? <Icon size={18} /> : null}
      {children}
    </button>
  )
}
