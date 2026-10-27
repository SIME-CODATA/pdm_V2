import { FileDown } from 'lucide-react'

interface DocumentActionProps {
  label: string
  href?: string | null
}

export function DocumentAction({ label, href }: DocumentActionProps) {
  const styles = [
    'inline-flex min-h-10 w-full items-center justify-center gap-2',
    'rounded-md bg-secondary px-3 py-2',
    'text-center text-xs font-medium text-white',
  ].join(' ')

  const content = (
    <>
      <FileDown size={17} aria-hidden="true" />
      <span>{label}</span>
    </>
  )

  if (!href) {
    return (
      <button type="button" disabled title="Documento ainda não disponível" className={`${styles} cursor-not-allowed opacity-80`}>
        {content}
      </button>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles} focus-visible:outline-primary transition-colors hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2`}>
      {content}
    </a>
  )
}
