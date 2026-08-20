export default function MidiaSlide({ midia, onVideoEnded }) {
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      {midia.tipo === 'video' ? (
        <video
          key={midia.id}
          src={midia.url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          onEnded={onVideoEnded}
        />
      ) : (
        <img src={midia.url} alt={midia.titulo ?? ''} className="w-full h-full object-cover" />
      )}

      {midia.titulo && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-10 py-8">
          <p className="font-display text-3xl lg:text-5xl font-bold text-white drop-shadow-lg">{midia.titulo}</p>
        </div>
      )}
    </div>
  )
}
