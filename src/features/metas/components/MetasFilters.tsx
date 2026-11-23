import { ChevronDown, Search } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { MetaSummary } from '../api/metas.schemas'
import type { TerritoryFeature } from '../map/metas.geo'
import { territoryName, territoryKey } from '../map/metas.geo'
import { metasContent } from '../data/metas.content'

interface Props {
  metas: MetaSummary[]
  features: TerritoryFeature[]
  search: string
  axis: string
  territory: string | null
  onSearch: (next: string) => void
  onAxis: (next: string) => void
  onTerritory: (next: string | null) => void
}

/** Filtros do Figma: busca, subprefeitura e um único eixo ativo. */
export function MetasFilters({ features, search, axis, territory, onSearch, onAxis, onTerritory }: Props) {
  const names = [...features].map(feature => territoryName(feature))
    .filter(Boolean).sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return <div className="metas-filters" aria-label="Filtros das metas">
    <div className="metas-filters__top">
      <label className="metas-filters__search">
        <Search size={16} aria-hidden="true" />
        <input type="search" value={search} onChange={e => onSearch(e.target.value)}
          placeholder={metasContent.searchPlaceholder} aria-label="Pesquisar metas" />
      </label>
      <label className="metas-filters__quick-select">
        <select aria-label="Selecionar subprefeitura" value={territory ?? ''}
          onChange={e => onTerritory(e.target.value || null)}>
          <option value="">Subprefeitura</option>
          {names.map(name => <option key={territoryKey(name)} value={territoryKey(name)}>{name}</option>)}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </label>
    </div>
    <div className="metas-filters__axes" role="group" aria-label="Eixo do Programa">
      {metasContent.axes.map(item => {
        const selected = axis === item.name
        return <button key={item.name} type="button" aria-pressed={selected}
          className={`metas-filters__axis${selected ? ' metas-filters__axis--selected' : ''}${axis && !selected ? ' metas-filters__axis--inactive' : ''}`}
          style={{ '--axis-color': item.color } as CSSProperties}
          onClick={() => onAxis(selected ? '' : item.name)}>{item.name}</button>
      })}
    </div>
  </div>
}
