import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import type { MetaSummary } from '../api/metas.schemas'
import { emptyFilters, uniq } from '../lib/metas.utils'
import type { ActiveFilters } from '../lib/metas.utils'
import { metasContent } from '../data/metas.content'

interface Props {
  metas: MetaSummary[]
  value: ActiveFilters
  onChange: (value: ActiveFilters) => void
}

type FilterKey = keyof ActiveFilters

function changeFilter(value: ActiveFilters, onChange: Props['onChange'], key: FilterKey, next: string) {
  onChange({ ...value, [key]: next, ...(key === 'region' ? { subprefeitura: '' } : {}) })
}

function FilterSelect({ title, value, items, onChange, disabled = false }: {
  title: string
  value: string
  items: string[]
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return <label>{title}<select value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
    <option value="">Todos</option>
    {items.map(item => <option key={item} value={item}>{item}</option>)}
  </select></label>
}

// Parte sempre visível, conforme o Figma: busca, subprefeitura rápida e eixos.
export function MetasFilters({ metas, value, onChange }: Props) {
  const subprefeituras = uniq(metas
    .filter(meta => !value.region || meta.regioes.includes(value.region))
    .flatMap(meta => meta.subprefeituras))
  const update = (key: FilterKey, next: string) => changeFilter(value, onChange, key, next)

  return <div className="metas-filters">
    <div className="metas-filters__top">
      <label className="metas-filters__search">
        <Search aria-hidden="true" size={17} />
        <input type="search" value={value.search} onChange={event => update('search', event.target.value)}
          placeholder={metasContent.searchPlaceholder} aria-label="Pesquisar metas por número ou texto" />
      </label>
      <label className="metas-filters__quick-select">
        <select aria-label="Selecionar subprefeitura" value={value.subprefeitura}
          onChange={event => update('subprefeitura', event.target.value)}>
          <option value="">Subprefeitura</option>
          {subprefeituras.map(name => <option value={name} key={name}>{name}</option>)}
        </select>
        <ChevronDown size={15} aria-hidden="true" />
      </label>
    </div>
    <div className="metas-filters__axes" role="group" aria-label="Filtrar metas por eixo">
      {metasContent.axes.map(axis => <button type="button" key={axis.name}
        aria-pressed={value.eixo === axis.name}
        className={`metas-filters__axis${value.eixo && value.eixo !== axis.name ? ' metas-filters__axis--inactive' : ''}`}
        style={{ backgroundColor: axis.color }}
        onClick={() => update('eixo', value.eixo === axis.name ? '' : axis.name)}>{axis.name}</button>)}
    </div>
  </div>
}

// Os filtros detalhados não ocupam a sidebar; ficam atrás de um dropdown no cabeçalho.
export function MetasAdvancedFilters({ metas, value, onChange }: Props) {
  const regions = uniq(metas.flatMap(meta => meta.regioes))
  const subprefeituras = uniq(metas
    .filter(meta => !value.region || meta.regioes.includes(value.region))
    .flatMap(meta => meta.subprefeituras))
  const organs = uniq(metas.flatMap(meta => meta.orgaos ?? []))
  const plans = uniq(metas.flatMap(meta => meta.planos_vinculados ?? []))
  const update = (key: FilterKey, next: string) => changeFilter(value, onChange, key, next)
  const count = Number(value.regional !== 'all') + Number(!!value.region) +
    Number(!!value.subprefeitura) + Number(!!value.orgao) + Number(!!value.plano)

  return <details className="metas-page__advanced">
    <summary className="metas-page__advanced-trigger" aria-label="Abrir filtros adicionais">
      <SlidersHorizontal size={17} aria-hidden="true" />
      <span>Filtros</span>
      {count > 0 && <span className="metas-page__filter-count">{count}</span>}
      <ChevronDown size={15} aria-hidden="true" />
    </summary>
    <div className="metas-page__advanced-panel">
      <strong>Mais opções de filtro</strong>
      <div className="metas-filters__controls">
        <label>Regionalização
          <select value={value.regional} onChange={event => update('regional', event.target.value)}>
            <option value="all">Todas</option>
            <option value="regionalized">Regionalizáveis</option>
            <option value="nonregionalized">Não regionalizáveis</option>
          </select>
        </label>
        <FilterSelect title="Região" value={value.region} items={regions} onChange={next => update('region', next)} />
        <FilterSelect title="Subprefeitura" value={value.subprefeitura} items={subprefeituras}
          onChange={next => update('subprefeitura', next)} />
        <FilterSelect title="Órgão" value={value.orgao} items={organs} disabled={!organs.length}
          onChange={next => update('orgao', next)} />
        <FilterSelect title="Plano vinculado" value={value.plano} items={plans} disabled={!plans.length}
          onChange={next => update('plano', next)} />
      </div>
      {(!organs.length || !plans.length) && <p className="metas-filters__help">
        Órgãos e planos serão habilitados quando a API disponibilizar os vínculos por meta.
      </p>}
      <button className="metas-filters__reset" type="button" onClick={() => onChange({ ...emptyFilters })}>
        <RotateCcw size={15} /> Limpar filtros
      </button>
    </div>
  </details>
}
