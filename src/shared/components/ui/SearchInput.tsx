import { Search } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'
interface SearchInputProps extends ComponentPropsWithoutRef<'input'> { containerClassName?: string }

export function SearchInput({containerClassName = '',className = '',placeholder = 'Pesquise por termos...',...props}: SearchInputProps) {
  return (
    <div className={`bg-search-surface text-primary focus-within:ring-secondary flex h-9 items-center gap-3 rounded px-3 focus-within:ring-2 ${containerClassName}`}>
        <Search size={19} strokeWidth={2} aria-hidden="true" />

        <input type="search" aria-label="Pesquisar no Programa de Metas" placeholder={placeholder} className={`placeholder:text-primary/80 min-w-0 flex-1 bg-transparent text-sm outline-none ${className}`} {...props} />
    </div>
  )
}
