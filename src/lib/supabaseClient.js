import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso normalmente significa que o arquivo .env não foi criado/preenchido.
  // Veja o README.md para instruções.
  console.error(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados. ' +
      'Copie .env.example para .env e preencha com os dados do seu projeto.',
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const OFERTAS_BUCKET = 'ofertas-imagens'
