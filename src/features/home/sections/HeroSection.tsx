import { SearchInput } from '@/shared/components/ui/SearchInput'
import logoPDM from '@/assets/images/logo_pdm_letras.svg'
import { DocumentAction } from '../components/DocumentAction'
import './style/HeroSection.css'

const documents = [
  {
    id: 'programa-metas',
    label: 'PDF Programa de Metas',
    href: null,
  },
  {
    id: 'relatorio-execucao',
    label: 'Relatório de Execução',
    href: null,
  },
] as const

export function HeroSection() {
  return (
    <section aria-label="Apresentação do Programa de Metas" className="hero-section" >
      {/* Identidade e pesquisa */}
      <div className="hero-section__content">
        <img src={logoPDM} alt="Programa de Metas 2025/2028" className="h-41 w-auto max-w-80 object-contain"/>

        <div className="mt-12 w-full max-w-117.5">
            <SearchInput size="lg" placeholder="Pesquise sua meta de interesse..." aria-label="Pesquisar metas de interesse" disabled/>
        </div>
      </div>

      {/* Painel de documentos */}
      <aside aria-label="Documentos do Programa de Metas" className="hero-section__documents">
        <p className="max-w-61.25 font-sans text-base leading-snug font-semibold text-white">
          Para conhecer mais detalhes do Programa de Metas
          navegue também pelos documentos em pdf!
        </p>

        <div className="mt-7 flex w-full max-w-51.25 flex-col gap-3">
          {documents.map((document) => (
            <DocumentAction key={document.id} label={document.label} href={document.href} />
          ))}
        </div>
      </aside>
    </section>
  )
}