import { ArrowRight } from 'lucide-react'

interface MoreButtonProps {
  href?: string | null
  label?: string
}

const buttonStyle =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-sm bg-primary px-6 py-2 font-display text-xl text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

export function MoreButton({ href, label = 'Saiba mais' }: MoreButtonProps) {
  const inner = (
    <>
      <span>{label}</span>
      <ArrowRight aria-hidden="true" size={19} />
    </>
  )

  if (!href) {
    return (
      <button type="button" className={`${buttonStyle} cursor-not-allowed`} disabled>
        {inner}
      </button>
    )
  }

  return (
    <a className={`${buttonStyle} hover:brightness-110`} href={href}>
      {inner}
    </a>
  )
}
