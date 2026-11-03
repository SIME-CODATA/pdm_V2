import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import FiltroEixosCards from './legacy/FiltroEixos.jsx'
import type { MetaDetail, MetaSummary } from '../api/metas.schemas'
import { getMeta } from '../api/metas.repository'
import { sameName, axisColor } from '../lib/metas.utils'
import './NonRegionalMetasSection.css'

interface Props { metas: MetaSummary[]; onOpen: (code: string) => void }

// Adaptado de FiltroEixos.jsx do site anterior. A taxonomia é a publicada pela API
// legada /filtro_metas/parametros_eixos; vínculos por meta são lidos da API nova.
const AXES = [
  { name: 'Universo SP', color: '#3DB54A', light: '#87C98E', themes: ['Natureza e ambiente', 'Habitação de qualidade', 'Infraestrutura e integração', 'Mobilidade', 'Requalificação urbana'] },
  { name: 'Viver São Paulo', color: '#F16622', light: '#D6A790', themes: ['Segurança', 'Saúde e bem-estar', 'Educação', 'Proteção social e cidadania plena', 'Cultura, Esporte e Lazer'] },
  { name: 'Cidade Empreendedora', color: '#0000AB', light: '#9898CC', themes: ['Ambiente de negócios', 'Economia criativa', 'Qualificação profissional, emprego e renda'] },
  { name: 'Capital do Futuro', color: '#792D49', light: '#C2849B', themes: ['Modernização e inovação', 'Transparência e participação cidadã', 'Governo ágil e acessível a todos'] },
] as const

function tagsOf(meta: MetaSummary | MetaDetail): string[] {
  const data = meta as MetaSummary & { classificacoes?: { tags?: string[] }; tags?: string[]; tema?: string; temas?: (string | { nome?: string })[] }
  const themes = Array.isArray(data.temas) ? data.temas.map(x => typeof x === 'string' ? x : x.nome ?? '') : []
  return [...(data.classificacoes?.tags ?? []), ...(data.tags ?? []), ...(data.tema ? [data.tema] : []), ...themes]
}

export function NonRegionalMetasSection({ metas, onOpen }: Props) {
  const queryClient = useQueryClient()
  const [excluded, setExcluded] = useState<string[]>([])
  const [selectedThemes, setSelectedThemes] = useState<string[]>([])
  const nonRegional = useMemo(() => metas.filter(meta => !meta.regionalizada), [metas])
  const activeMetas = useMemo(() => nonRegional.filter(meta => !excluded.some(name => sameName(name, meta.eixo.nome))), [nonRegional, excluded])
  const toLoad = useMemo(() => selectedThemes.length ? activeMetas.filter(meta => !tagsOf(meta).some(t => selectedThemes.some(selected => sameName(t, selected)))) : [], [activeMetas, selectedThemes])

  // Só consulta detalhes se o visitante selecionar um tema. A listagem não traz
  // classificacoes.tags; os GET individuais ficam no cache compartilhado do modal.
  const themeQuery = useQuery({
    queryKey: ['pdm-v2', 'nonregional-theme-index', toLoad.map(meta => meta.codigo).join(',')],
    enabled: selectedThemes.length > 0 && toLoad.length > 0,
    staleTime: 10 * 60_000,
    retry: 0,
    queryFn: async () => {
      const items: Record<string, string[]> = {}
      const errors: string[] = []
      let cursor = 0
      await Promise.all(Array.from({ length: Math.min(4, toLoad.length) }, async () => {
        while (cursor < toLoad.length) {
          const code = toLoad[cursor++].codigo
          try {
            const detail = await queryClient.fetchQuery({
              queryKey: ['pdm-v2', 'metas', code],
              queryFn: ({ signal }) => getMeta(code, signal),
              staleTime: 10 * 60_000,
              retry: 0,
            })
            items[code] = tagsOf(detail)
          } catch { errors.push(code) }
        }
      }))
      return { items, errors }
    },
  })
  const waiting = selectedThemes.length > 0 && toLoad.length > 0 && themeQuery.isPending
  const visible = useMemo(() => activeMetas.filter(meta => {
    if (!selectedThemes.length) return true
    const tags = [...tagsOf(meta), ...(themeQuery.data?.items[meta.codigo] ?? [])]
    return selectedThemes.some(theme => tags.some(tag => sameName(tag, theme)))
  }), [activeMetas, selectedThemes, themeQuery.data])

  function toggleAxis(name: string) {
    setExcluded(prev => prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name])
    setSelectedThemes(prev => prev.filter(theme => !AXES.find(axis => axis.name === name)?.themes.some(t => sameName(t, theme))))
  }
  function toggleTheme(theme: string) { setSelectedThemes(prev => prev.includes(theme) ? prev.filter(x => x !== theme) : [...prev, theme]) }
  function toggleLegacy(key: string, id: string | number) {
    const value = String(id)
    if (key === 'eixos') toggleAxis(value)
    if (key === 'subeixos') {
      const axis = AXES.find(item => item.themes.some(theme => sameName(theme, value)))
      if (axis && excluded.includes(axis.name)) setExcluded(prev => prev.filter(name => name !== axis.name))
      toggleTheme(value)
    }
  }
  const legacyAxes = AXES.map((axis, index) => ({
    id: index + 1,
    nome: axis.name,
    temas: axis.themes.map(theme => ({ id: theme, nome: theme })),
  }))
  // O legado usa IDs numéricos para os eixos. Mantemos a mesma correspondência.
  const selectedAxisIds = AXES.flatMap((axis, index) => excluded.includes(axis.name) ? [] : [index + 1])
  function toggleLegacySelection(key: string, id: string | number) {
    if (key === 'eixos') {
      const axis = AXES[Number(id) - 1]
      if (axis) toggleAxis(axis.name)
    } else toggleLegacy(key, id)
  }

  return <section className="metas-nonregional" aria-labelledby="nonregional-title">
    <div className="metas-nonregional__inner">
      <h2 id="nonregional-title">Visualize a lista completa das metas não regionalizáveis</h2>
      <div className="metas-nonregional__legacy-axes" aria-label="Filtros por eixo e tema">
        <FiltroEixosCards
          eixos={legacyAxes}
          filtrosSelecionados={{ eixos: selectedAxisIds, subeixos: selectedThemes }}
          toggleSelecionado={toggleLegacySelection}
          subeixoFilterKey="subeixos"
        />
      </div>
      <p className="metas-nonregional__count" aria-live="polite">
        {waiting ? 'Carregando temas das metas pela API…' : `${visible.length} de ${nonRegional.length} metas não regionalizáveis`}
      </p>
      {!!themeQuery.data?.errors.length && selectedThemes.length > 0 && <p className="metas-nonregional__notice" role="status">Não foi possível consultar o tema de {themeQuery.data.errors.length} metas. O resultado pode estar incompleto.</p>}
      {themeQuery.isError && <p className="metas-nonregional__notice" role="alert">Não foi possível consultar os temas na API. Tente novamente.</p>}
      <div className="metas-nonregional__list">
        {waiting ? <p className="metas-nonregional__empty">Verificando vínculos entre temas e metas…</p> : visible.length ? visible.map(meta => <button type="button" key={meta.codigo} className="metas-nonregional__item" onClick={() => onOpen(meta.codigo)}>
          <span className="metas-nonregional__number" style={{ color: axisColor(meta) }}>{meta.numero.padStart(2, '0')}</span>
          <span className="metas-nonregional__copy"><strong>{meta.titulo_destaque || meta.titulo}</strong>{meta.titulo_complemento && <span>{meta.titulo_complemento}</span>}</span>
          <span className="metas-nonregional__arrow" style={{ backgroundColor: axisColor(meta) }}><ArrowRight size={18} aria-hidden="true" /></span>
        </button>) : <p className="metas-nonregional__empty">Nenhuma meta encontrada para os eixos e temas selecionados.</p>}
      </div>
    </div>
  </section>
}
