import { useRef, useState } from 'react'
import { FileVideo, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useToast } from '../../context/ToastContext.jsx'

const BUCKET = 'midias-panificadora'
const TAMANHO_MAXIMO_BYTES = 30 * 1024 * 1024 // 30MB
const TIPOS_PERMITIDOS = {
  'image/jpeg': 'imagem',
  'image/png': 'imagem',
  'image/webp': 'imagem',
  'image/gif': 'imagem',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/quicktime': 'video',
}

/**
 * value: { url, path, tipo } | null
 * onChange: (novoValue) => void
 */
export default function MidiaUpload({ value, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const tipo = TIPOS_PERMITIDOS[file.type]
    if (!tipo) {
      toast.error('Formato não suportado. Use JPG, PNG, WEBP, GIF, MP4, WEBM ou MOV.')
      return
    }
    if (file.size > TAMANHO_MAXIMO_BYTES) {
      toast.error('O arquivo deve ter no máximo 30MB.')
      return
    }

    setUploading(true)
    try {
      const extensao = file.name.split('.').pop()
      const nomeArquivo = `${crypto.randomUUID()}.${extensao}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(nomeArquivo, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(nomeArquivo)

      if (value?.path) {
        await supabase.storage.from(BUCKET).remove([value.path])
      }

      onChange({ url: publicUrlData.publicUrl, path: nomeArquivo, tipo })
    } catch (err) {
      console.error(err)
      toast.error('Não foi possível enviar o arquivo. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (value?.path) {
      await supabase.storage.from(BUCKET).remove([value.path])
    }
    onChange(null)
  }

  return (
    <div>
      {value?.url ? (
        <div className="relative w-full h-44 rounded-xl overflow-hidden border border-bakery-brown-100 bg-black">
          {value.tipo === 'video' ? (
            <video src={value.url} className="w-full h-full object-cover" muted autoPlay loop playsInline />
          ) : (
            <img src={value.url} alt="Prévia" className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-black/60 hover:bg-red-600 text-white p-2 transition-colors"
            aria-label="Remover arquivo"
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
              <span className="text-sm font-medium">Enviando arquivo...</span>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <ImagePlus size={28} />
                <FileVideo size={28} />
              </div>
              <span className="text-sm font-medium">Clique para escolher uma foto ou vídeo</span>
              <span className="text-xs text-bakery-brown-300">JPG, PNG, MP4 ou WEBM · até 30MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileSelected}
      />
    </div>
  )
}
