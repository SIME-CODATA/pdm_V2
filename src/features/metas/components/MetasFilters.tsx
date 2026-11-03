import { RotateCcw, Search } from 'lucide-react'
import type { MetaSummary } from '../api/metas.schemas'
import { emptyFilters, uniq } from '../lib/metas.utils'
import type { ActiveFilters } from '../lib/metas.utils'
import { metasContent } from '../data/metas.content'
interface Props {
  metas: MetaSummary[]
  value: ActiveFilters
  onChange: (value: ActiveFilters) => void
}
function FilterSelect({
  title,
  value,
  items,
  onChange,
  disabled = false,
}: {
  title: string
  value: string
  items: string[]
  onChange: (s: string) => void
  disabled?: boolean
}) {
  return (
    <label>
      {title}
      <select disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todos</option>
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  )
}
export function MetasFilters({ metas, value, onChange }: Props) {
  const update = (key: keyof ActiveFilters, newValue: string) =>
    onChange({ ...value, [key]: newValue, ...(key === 'region' ? { subprefeitura: '' } : {}) })
  const regions = uniq(metas.flatMap((x) => x.regioes)),
    subprefs = uniq(
      metas
        .filter((x) => !value.region || x.regioes.includes(value.region))
        .flatMap((x) => x.subprefeituras),
    )
  const organs = uniq(metas.flatMap((x) => x.orgaos || [])),
    plans = uniq(metas.flatMap((x) => x.planos_vinculados || []))
  return (
    <div className="metas-filters">
      <div className="metas-filters__search">
        <Search size={18} />
        <input
          value={value.search}
          onChange={(e) => update('search', e.target.value)}
          type="search"
          placeholder={metasContent.searchPlaceholder}
          aria-label="Buscar meta por número ou texto"
        />
      </div>
      <div className="metas-filters__axes" aria-label="Filtrar por eixo">
        {metasContent.axes.map((axis) => (
          <button
            key={axis.name}
            type="button"
            aria-pressed={value.eixo === axis.name}
            onClick={() => update('eixo', value.eixo === axis.name ? '' : axis.name)}
            style={{ backgroundColor: axis.color }}
            className={`metas-filters__axis ${value.eixo && value.eixo !== axis.name ? 'metas-filters__axis--inactive' : ''}`}
          >
            {axis.name}
          </button>
        ))}
      </div>
      <div className="metas-filters__controls">
        <label>
          Regionalização
          <select value={value.regional} onChange={(e) => update('regional', e.target.value)}>
            <option value="all">Todas</option>
            <option value="regionalized">Regionalizáveis</option>
            <option value="nonregionalized">Não regionalizáveis</option>
          </select>
        </label>
        <FilterSelect
          title="Região"
          value={value.region}
          items={regions}
          onChange={(s) => update('region', s)}
        />
        <FilterSelect
          title="Subprefeitura"
          value={value.subprefeitura}
          items={subprefs}
          onChange={(s) => update('subprefeitura', s)}
        />
        <FilterSelect
          title="Órgão"
          disabled={!organs.length}
          value={value.orgao}
          items={organs}
          onChange={(s) => update('orgao', s)}
        />
        <FilterSelect
          title="Plano vinculado"
          disabled={!plans.length}
          value={value.plano}
          items={plans}
          onChange={(s) => update('plano', s)}
        />
      </div>
      {(!organs.length || !plans.length) && (
        <p className="metas-filters__help">
          Órgãos e planos aguardam vínculos por meta no endpoint de listagem (não basta enviar
          apenas as opções de filtro).
        </p>
      )}
      <button
        type="button"
        className="metas-filters__reset"
        onClick={() => onChange({ ...emptyFilters })}
      >
        <RotateCcw size={15} /> Limpar filtros
      </button>
    </div>
  )
}
