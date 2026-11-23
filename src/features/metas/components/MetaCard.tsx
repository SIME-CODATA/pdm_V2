import { ArrowRight } from 'lucide-react'
import type { MetaSummary } from '../api/metas.schemas'
import {axisColor, territorialStatus,} from '../lib/metas.utils'
interface Props {meta: MetaSummary, onOpen: (code: string) => void, selected?: boolean, aggregated?: boolean,}

type MetaWithContent = MetaSummary & {titulo_destaque?: string | null, titulo_complemento?: string | null,}

export function MetaCard({meta, onOpen, selected = false, aggregated = false,}: Props) {
  const status = territorialStatus(meta)
  const color = axisColor(meta)
  const isNonRegional = status === 'nonregionalized' || meta.regionalizada === false
  const content = meta as MetaWithContent
  const title = content.titulo_destaque?.trim() || meta.titulo
  const description = content.titulo_complemento?.trim() || ''

  return (
    <button type="button" onClick={() => onOpen(meta.codigo)} data-meta-code={meta.codigo} aria-pressed={selected} aria-label={`Abrir detalhes da Meta ${meta.numero}`} className={` group bg-white rounded-2xl relative flex w-full min-h-35 items-center gap-5 px-5 py-7 text-left transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#272361] sm:gap-7 sm:px-6 ${ selected ? 'ring-2 ring-[#272361] shadow-md' : 'shadow-none'}`}>
      {/* NÚMERO DA META */}
      <span className="shrink-0 min-w-15.5 text-center font-display text-8xl! leading-none tracking-tight sm:min-w-19.5 sm:text-[76px]" style={{ color }}> {String(meta.numero).padStart(2, '0')}
      </span>

      {/* INFORMAÇÕES */}
      <span className="flex min-w-0 flex-1 flex-col gap-2 pr-5">
        <span className="font-display text-2xl! leading-tight text-black sm:text-[21px]"> {title} </span>
        {description && (
          <span className="text-lg font-normal leading-[1.4] text-[#696969] sm:text-[14px]">
            {description}
          </span>
        )}

        {!!meta.orgaos?.length && (
          <span className="mt-1 text-[11px] font-medium text-[#777777]">
            {meta.orgaos.join(' | ')}
          </span>
        )}
      </span>

      {/* ETIQUETAS */}
      {(isNonRegional || aggregated) && (
        <span className="absolute right-5 top-3 flex flex-wrap items-center justify-end gap-1">
          {isNonRegional && (
            <span className="rounded-full bg-[#272361] px-2 py-0.75 text-xs font-normal leading-none text-white whitespace-nowrap">
              Não regionalizável
            </span>
          )}

          {aggregated && (
            <span className="rounded-full bg-[#0079AB] px-2 py-0.75 text-xs font-normal leading-none text-white whitespace-nowrap">
              Agregadas
            </span>
          )}
        </span>
      )}

      {/* SETA CIRCULAR */}
      <span className="absolute right-5 top-10 flex h-5.5 w-5.5 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" style={{ backgroundColor: color }} aria-hidden="true">
        <ArrowRight size={13} strokeWidth={2.5} />
      </span>
    </button>
  )
}
