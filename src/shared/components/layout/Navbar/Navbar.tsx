import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Container } from '@/shared/components/layout/Container'
import { SearchInput } from '@/shared/components/ui/SearchInput'
import { NAV_ITEMS } from './navbar.constants'
import logoNavbar from '@/assets/images/logo_navbar.svg'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  function closeMenu() { setIsMenuOpen(false) }

  return (
    <header className="bg-primary relative z-50 w-full text-white">
        <Container className="flex min-h-20 items-center gap-5 py-3">
            {/* Identidade visual */}
            <a href="/" aria-label="Programa de Metas - Página inicial" className="flex shrink-0 items-center gap-4" onClick={closeMenu}>
                <img src={logoNavbar} alt="Cidade de São Paulo - Programa de Metas 2025/2028" className="h-11 w-auto max-w-60 object-contain"/>
            </a>

            {/* Navegação desktop */}
            <nav aria-label="Navegação principal" className="ml-auto hidden items-center gap-8 lg:flex">
                {NAV_ITEMS.map((item) => (
                    <a key={item.href} href={item.href} className="text-sm font-medium whitespace-nowrap text-white/90 transition-colors hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white" >
                        {item.label}
                    </a>
                ))}
            </nav>

            {/* Busca desktop e tablet */}
            <div className="ml-auto hidden w-64 shrink-0 md:block lg:ml-10 lg:w-75">
                <SearchInput />
            </div>

            {/* Botão mobile */}
            <button type="button" aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={isMenuOpen} aria-controls="navbar-mobile-navigation" onClick={() => setIsMenuOpen((previous) => !previous)} className="ml-auto rounded-md md:p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white md:ml-0 lg:hidden">
                {isMenuOpen ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
            </button>
        </Container>

      {/* Navegação mobile e tablet */}
        {isMenuOpen && (
            <div id="navbar-mobile-navigation" className="bg-primary border-t border-white/15 lg:hidden" >
                <Container className="py-5">
                    <nav aria-label="Navegação mobile" className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => (
                            <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-md px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white">
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    {/* Busca em telas pequenas */}
                    <div className="mt-5 md:hidden">
                        <SearchInput />
                    </div>
                </Container>
            </div>
        )}
    </header>
    )
}
