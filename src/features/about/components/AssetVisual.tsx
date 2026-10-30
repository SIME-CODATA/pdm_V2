import type { ReactNode } from 'react'
import { useState } from 'react'

interface AssetVisualProps {
  src: string | null
  alt: string
  className?: string
  imageClassName?: string
  fallback: ReactNode
}

/** Imagem opcional com fallback, inclusive se o caminho local estiver incorreto. */
export function AssetVisual({ src, alt, className = '', imageClassName = '', fallback }: AssetVisualProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={className}>
      {src && !failed ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full object-cover ${imageClassName}`}/>
      ) : fallback}
    </div>
  )
}
