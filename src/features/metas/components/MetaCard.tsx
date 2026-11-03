import type { MetaSummary } from '../api/metas.schemas'
import { axisColor, territorialStatus } from '../lib/metas.utils'
import { metasContent } from '../data/metas.content'

interface Props {
  meta: MetaSummary
  onOpen: (code: string) => void
  selected?: boolean
}

export function MetaCard({ meta, onOpen, selected = false }: Props) {
  const status = territorialStatus(meta)
  const territories = meta.subprefeituras.slice(0, 2)
  const remaining = meta.subprefeituras.length - territories.length

  return <button type="button" onClick={() => onOpen(meta.codigo)}
    className={`metas-card${selected ? ' metas-card--selected' : ''}`}
    data-meta-code={meta.codigo} aria-pressed={selected}
    style={{ backgroundColor: !meta.regionalizada ? metasContent.nonRegionalizedTint : undefined }}>
    <span className="metas-card__number" style={{ color: axisColor(meta) }}>
      {meta.numero.padStart(2, '0')}
    </span>
    <span className="metas-card__body">
      <span className="metas-card__chips">
        {status === 'nonregionalized'
          ? <span className="metas-card__chip metas-card__chip--nonregional">Não regionalizável</span>
          : status === 'without-territory'
            ? <span className="metas-card__chip metas-card__chip--muted">Território não informado</span>
            : <>{territories.map(name =>
              <span key={name} className="metas-card__chip metas-card__chip--territory">{name}</span>)}
              {remaining > 0 && <span className="metas-card__chip metas-card__chip--more">+{remaining}</span>}</>}
      </span>
      <span className="metas-card__description">{meta.titulo}</span>
      {!!meta.orgaos?.length && <span className="metas-card__orgs">{meta.orgaos.join('  |  ')}</span>}
    </span>
  </button>
}
