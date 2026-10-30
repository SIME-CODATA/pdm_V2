import { ArrowRight } from 'lucide-react'

type AboutActionProps = {
  children: string
  href: string | null
  variant?: 'solid' | 'outline' | 'light'
  arrow?: boolean
  className?: string
}

const variants = {
  solid: 'bg-[#0079AB] text-white',
  outline: 'border border-white text-white',
  light: 'bg-white text-[#0079AB] shadow-sm',
} as const

export function AboutAction({ children, href, variant = 'solid', arrow = false, className = '' }: AboutActionProps) {
  const styles = `inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-center font-display text-lg leading-none transition-opacity ${variants[variant]} ${className}`
  const label = <>{children}{arrow && <ArrowRight aria-hidden="true" size={17} />}</>

  if (!href) {
    return <button type="button" disabled title="Destino ainda não disponível" className={`${styles} cursor-not-allowed opacity-85`}>{label}</button>
  }

  return <a href={href} className={`${styles} hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2`}>{label}</a>
}
