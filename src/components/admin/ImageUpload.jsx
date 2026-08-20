import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { supabase, OFERTAS_BUCKET } from '../../lib/supabaseClient'
import { useToast } from '../../context/ToastContext.jsx'

const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024 // 5MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * value: { url, path } | null
 * onChange: (novoValue) => void
 */
export default function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // permite selecionar o mesmo arquivo novamente depois
    if (!file) return

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      toast.error('Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF.')
      return
    }
    if (file.size > TAMANHO_MAXIMO_BYTES) {
      toast.error('A imagem deve ter no máximo 5MB.')
      return
    }

    setUploading(true)
    try {
      const extensao = file.name.split('.').pop()
      const nomeArquivo = `${crypto.randomUUID()}.${extensao}`

      const { error: uploadError } = await supabase.storage
        .from(OFERTAS_BUCKET)
        .upload(nomeArquivo, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from(OFERTAS_BUCKET).getPublicUrl(nomeArquivo)

      // Se já existia uma imagem antiga enviada por nós, remove para não acumular lixo no storage
      if (value?.path) {
        await supabase.storage.from(OFERTAS_BUCKET).remove([value.path])
      }

      onChange({ url: publicUrlData.publicUrl, path: nomeArquivo })
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível enviar a imagem. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (value?.path) {
      await supabase.storage.from(OFERTAS_BUCKET).remove([value.path])
    }
    onChange(null)
  }

  return (
    <div>
      {value?.url ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-bakery-brown-100 group">
          <img src={value.url} alt="Prévia da oferta" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-red-600 text-white p-2 transition-colors"
            aria-label="Remover imagem"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-44 rounded-xl border-2 border-dashed border-bakery-brown-300 flex flex-col items-center
            justify-center gap-2 text-bakery-brown-500 hover:bg-bakery-brown-50 transition-colors disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={28} />
              <span className="text-sm font-medium">Enviando imagem...</span>
            </>
          ) : (
            <>
              <ImagePlus size={28} />
              <span className="text-sm font-medium">Clique para escolher uma foto</span>
              <span className="text-xs text-bakery-brown-300">JPG, PNG ou WEBP · até 5MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  )
}
