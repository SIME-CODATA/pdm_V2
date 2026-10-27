import { Search } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'

type SearchInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'size'> & {
  size?: 'sm' | 'lg'
  containerClassName?: string
}

export function SearchInput({
  size = 'sm',
  containerClassName = '',
  className = '',
  placeholder = 'Pesquise por termos...',
  ...props
}: SearchInputProps) {
  const isLarge = size === 'lg'

  return (
    <div
      className={[
        'bg-search-surface text-primary flex w-full items-center rounded-md',
        'focus-within:ring-secondary focus-within:ring-2',
        isLarge ? 'h-12 gap-4 px-5' : 'h-9 gap-3 px-3',
        containerClassName,
      ].join(' ')}
    >
      <Search size={isLarge ? 24 : 19} strokeWidth={2} className="shrink-0" aria-hidden="true" />

      <input
        type="search"
        aria-label="Pesquisar no Programa de Metas"
        placeholder={placeholder}
        className={[
          'min-w-0 flex-1 bg-transparent outline-none',
          'placeholder:text-primary/80',
          'disabled:cursor-not-allowed disabled:opacity-100',
          isLarge ? 'text-base' : 'text-sm',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  )
}
