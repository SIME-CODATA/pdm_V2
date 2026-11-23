import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, Target, CalendarCheck2, TrendingUp, CheckCircle2, CircleDollarSign, TreePine, Building2, HeartPulse, BriefcaseBusiness,
} from 'lucide-react'
import type { MetaSummary } from '../api/metas.schemas'
import { metasContent } from '../data/metas.content'
import { sameName } from '../lib/metas.utils'
import './OverviewPanel.css'
import ExecutionGauge from './ExecutionGauge'

type Obj = Record<string, unknown>
type RawMetric = { value: string; preview: boolean }
const DEFAULT_BASE = '/pdm-api/api/site'
const apiBase = ((import.meta.env.VITE_METAS_API_URL as string | undefined)?.trim() || DEFAULT_BASE).replace(/\/$/, '')
const urls = {
  summary: (import.meta.env.VITE_METAS_OVERVIEW_URL as string | undefined)?.trim() || `${apiBase}/visao-geral`,
  budget: (import.meta.env.VITE_METAS_OVERVIEW_BUDGET_URL as string | undefined)?.trim() || `${apiBase}/visao-geral/orcamento-geral`,
  indicators: (import.meta.env.VITE_METAS_OVERVIEW_INDICATORS_URL as string | undefined)?.trim() || `${apiBase}/visao-geral/conheca-metas`,
}

function object(value: unknown): Obj | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Obj : null
}
function normalized(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}
function roots(value: unknown): Obj[] {
  const result: Obj[] = []
  const visit = (current: unknown, depth: number) => {
    const item = object(current)
    if (!item || depth > 3) return
    result.push(item)
    for (const key of ['data', 'resultado', 'resumo', 'visao_geral', 'orcamento_geral', 'monitoramento', 'painel', 'indicadores', 'orcamento', 'totais']) {
      if (key in item) visit(item[key], depth + 1)
    }
  }
  visit(value, 0)
  return result
}
function pick(source: unknown, aliases: string[]): unknown {
  const keys = new Set(aliases.map(normalized))
  for (const root of roots(source)) {
    for (const [key, value] of Object.entries(root)) {
      if (keys.has(normalized(key)) && value !== null && value !== undefined && value !== '') return value
    }
  }
  return undefined
}
function first(sources: unknown[], aliases: string[]): unknown {
  for (const source of sources) {
    const value = pick(source, aliases)
    if (value !== undefined) return value
  }
  return undefined
}
function numeric(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const s = value.trim().replace(/\s/g, '')
  if (!s || /[a-zA-Z]/.test(s)) return null
  const clean = s.replace(/[^0-9,.-]/g, '')
  // Aceita 57.000.000.000, 48,8 e os formatos numéricos usuais do JSON.
  const numericText = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.')
    : /^(?:-?\d{1,3})(?:\.\d{3})+$/.test(clean) ? clean.replace(/\./g, '') : clean
  const n = Number(numericText)
  return Number.isFinite(n) ? n : null
}
function formatDecimal(n: number, digits = 1): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: digits })
}
function money(value: unknown): string | null {
  if (typeof value === 'string' && /(?:r\$|bilh|milh|\sbi\b|\smi\b)/i.test(value)) return value.trim()
  const n = numeric(value)
  if (n === null) return null
  if (Math.abs(n) >= 1_000_000_000) return `R$ ${formatDecimal(n / 1_000_000_000)} bi`
  if (Math.abs(n) >= 1_000_000) return `R$ ${formatDecimal(n / 1_000_000)} mi`
  return `R$ ${formatDecimal(n, 2)}`
}
function percent(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null
  const n = numeric(value)
  if (n === null) return typeof value === 'string' && value.includes('%') ? value : null
  return `${formatDecimal(n > 0 && n < 1 ? n * 100 : n)}%`
}
function metric(value: string | null | undefined, preview: string): RawMetric {
  return value !== null && value !== undefined && value !== ''
    ? { value, preview: false }
    : { value: preview, preview: true }
}
function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}
function apiMetric(sources: unknown[], aliases: string[], labelPattern?: RegExp): unknown {
  const direct = first(sources, aliases)
  if (direct !== undefined) return direct
  if (!labelPattern) return undefined
  for (const source of sources) {
    for (const root of roots(source)) {
      for (const listKey of ['list_conheca_metas', 'indicadores', 'cards', 'items', 'itens', 'metricas', 'metrics']) {
        const items = root[listKey]
        if (!Array.isArray(items)) continue
        for (const item of items) {
          const rec = object(item)
          if (!rec) continue
          const label = normalized(rec.nome ?? rec.titulo ?? rec.label ?? rec.indicador ?? rec.descricao)
          if (labelPattern.test(label)) return rec.valor ?? rec.value ?? rec.numero ?? rec.total
        }
      }
    }
  }
  return undefined
}
function axisBudgetFrom(source: unknown, name: string): unknown {
  for (const root of roots(source)) {
    for (const key of ['orcamentos_por_eixo', 'orcamento_por_eixo', 'eixos', 'por_eixo', 'orcamento_eixos']) {
      const value = root[key]
      if (Array.isArray(value)) {
        const matched = value.find(item => {
          const entry = object(item)
          return entry && sameName(String(entry.nome ?? entry.eixo ?? entry.name ?? ''), name)
        })
        const entry = object(matched)
        if (entry) return entry.orcamento ?? entry.orcamento_total ?? entry.valor ?? entry.total
      }
      const byName = object(value)
      if (byName) {
        for (const [k, v] of Object.entries(byName)) {
          if (sameName(k, name)) return object(v)?.orcamento ?? object(v)?.valor ?? v
        }
      }
    }
  }
  return undefined
}

async function getOptional(url: string, signal?: AbortSignal): Promise<unknown> {
  try {
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return await res.json() as unknown
  } catch (error) {
    if (signal?.aborted) throw error
    return null
  }
}

const axisDescriptions = [
  'São Paulo em sua dimensão física, natural e territorial.',
  'Proteção social, saúde, educação, cultura e segurança.',
  'Emprego, qualificação, negócios e economia criativa.',
  'Inovação, transparência e serviços públicos acessíveis.',
]
const axisIcons = [TreePine, HeartPulse, BriefcaseBusiness, Building2]
const PREVIEW = {
  budgetTotal: 'R$ 57 bi', committed: 'R$ 48,8 bi', axisBudget: 'R$ 13 bi',
  more50: '125', reached: '27', progress: '89%', actions: '134',
  totalActions: '353', execution: '48%',
}

interface Props { metas: MetaSummary[]; total: number }
export function OverviewPanel({ metas, total }: Props) {
  const [axisIndex, setAxisIndex] = useState(0)
  const { data } = useQuery({
    queryKey: ['pdm-v2', 'overview', 'figma-19nov', urls.summary, urls.budget, urls.indicators],
    queryFn: async ({ signal }) => {
      const [summary, budget, indicators] = await Promise.all([
        getOptional(urls.summary, signal), getOptional(urls.budget, signal), getOptional(urls.indicators, signal),
      ])
      return { summary, budget, indicators }
    },
    staleTime: 2 * 60_000, retry: 1,
  })

  const sources = [data?.summary, data?.indicators, data?.budget]
  const financial = [data?.budget, data?.summary]
  const axis = metasContent.axes[axisIndex]
  const AxisIcon = axisIcons[axisIndex]
  const countFromList = metas.filter(item => sameName(item.eixo.nome, axis.name)).length
  const countFromBudget = (() => {
    for (const source of [data?.budget, data?.summary]) {
      for (const root of roots(source)) {
        const items = root.orcamentos_por_eixo ?? root.orcamento_por_eixo ?? root.eixos
        if (!Array.isArray(items)) continue
        const match = items.map(object).find(item => item && sameName(String(item.nome ?? item.eixo ?? ''), axis.name))
        if (match) return numeric(match.qtd_metas ?? match.quantidade_metas ?? match.total_metas)
      }
    }
    return null
  })()
  const axisCount = metas.length ? countFromList : countFromBudget
  const reachedCalculated = metas.length ? metas.filter(item => normalized(item.monitoramento).includes('atingida')).length : null
  const progressCalculated = metas.length && total > 0
    ? Math.round(100 * metas.filter(item => /progresso|atingida/.test(normalized(item.monitoramento))).length / total)
    : null

  const overallBudget = metric(money(first(financial, ['orcamento_total', 'valor_orcamento_total', 'total_orcamento', 'orcamento_geral', 'total_previsto'])), PREVIEW.budgetTotal)
  const committed = metric(money(first(financial, ['recursos_empenhados', 'total_empenhado', 'valor_empenhado', 'empenhado', 'empenhado_total']) ??
    apiMetric(sources, ['recursos_empenhados'], /recursos_empenhados/)), PREVIEW.committed)
  const axisBudget = metric(money(axisBudgetFrom(data?.budget, axis.name) ?? axisBudgetFrom(data?.summary, axis.name)), axisIndex === 0 ? PREVIEW.axisBudget : '—')
  const more50 = metric(str(apiMetric(sources, ['metas_acima_50', 'metas_50_ou_mais', 'metas_mais_de_50_porcento', 'metas_com_mais_de_50_de_execucao'], /50.*execucao|metas.*50/)) ??
    (numeric(apiMetric(sources, ['metas_acima_50', 'metas_50_ou_mais', 'metas_com_mais_de_50_de_execucao']))?.toLocaleString('pt-BR') ?? null), PREVIEW.more50)
  const reachedRaw = apiMetric(sources, ['metas_atingidas', 'total_metas_atingidas', 'atingidas'], /metas_atingidas|metas_concluidas/)
  const reached = metric(str(reachedRaw) ?? (numeric(reachedRaw)?.toLocaleString('pt-BR') ?? (reachedCalculated?.toLocaleString('pt-BR') ?? null)), PREVIEW.reached)
  const progressRaw = apiMetric(sources, ['percentual_em_progresso_ou_atingidas', 'percentual_metas_em_progresso', 'metas_em_progresso_percentual', 'percentual_andamento'], /progresso.*atingida|andamento.*atingida/)
  const progress = metric(percent(progressRaw) ?? (progressCalculated !== null ? `${progressCalculated}%` : null), PREVIEW.progress)
  const actionsRaw = apiMetric(sources, ['acoes_estrategicas_concluidas', 'total_acoes_concluidas', 'acoes_concluidas'], /acoes.*concluid/)
  const actions = metric(str(actionsRaw) ?? (numeric(actionsRaw)?.toLocaleString('pt-BR') ?? null), PREVIEW.actions)
  const totalActionsRaw = apiMetric(sources, ['total_acoes_estrategicas', 'acoes_estrategicas_total', 'total_acoes'], /total.*acoes/)
  const totalActions = metric(str(totalActionsRaw) ?? (numeric(totalActionsRaw)?.toLocaleString('pt-BR') ?? null), PREVIEW.totalActions)
  const executionRaw = apiMetric(sources, ['percentual_execucao_total', 'execucao_total_percentual', 'percentual_execucao', 'execucao_total_pdm'], /execucao_total|execucao.*pdm/)
  const execution = metric(percent(executionRaw), PREVIEW.execution)
  const executionNumber = numeric(execution.value.replace('%', '').trim()) ?? 0
  const apiTotal = numeric(first([data?.summary, data?.budget, data?.indicators], ['total_metas', 'quantidade_metas', 'metas_total']))
  const totalDisplayed = total || metas.length || apiTotal || 132
  const totalPreview = total === 0 && metas.length === 0 && apiTotal === null

  return <section className="pdm-dashboard" aria-label="Visão geral, orçamento e monitoramento do Programa de Metas">
    <div className="pdm-dashboard__inner">
      <div className="min-w-0 flex flex-col items-stretch justify-center flex-nowrap pt-6">
        <div className="pdm-dashboard__cards">
          <article className="pdm-dashboard__total-card">
            <div className="pdm-dashboard__card-heading"><span>Total de metas</span><Target size={17} aria-hidden="true" /></div>
            <p className="pdm-dashboard__total-subtitle">divididas em 4 eixos</p>
            <strong className="pdm-dashboard__total-number">{totalDisplayed}{totalPreview ? <sup>†</sup> : null}</strong>
            <div className="pdm-dashboard__small-budget"><CircleDollarSign size={14} aria-hidden="true"/><span>orçamento: {overallBudget.value}</span></div>
          </article>
          <article className="pdm-dashboard__axes-card">
            <div className="pdm-dashboard__card-heading"><span>Eixos</span><SlidersHorizontal size={17} aria-hidden="true" /></div>
            <div className="pdm-dashboard__axes-content">
              <div className="pdm-dashboard__axis-tabs " role="group" aria-label="Selecionar eixo do painel">
                {metasContent.axes.map((item, i) => <button key={item.name} type="button"
                  className={`pdm-dashboard__axis-tab${axisIndex === i ? ' is-active' : ''}`}
                  style={axisIndex === i ? { backgroundColor: item.color } : undefined}
                  onClick={() => setAxisIndex(i)} aria-pressed={axisIndex === i}>{item.name}</button>)}
              </div>
              <div className="pdm-dashboard__axis-detail" style={{ '--axis-color': axis.color } as CSSProperties}>
                <div className="pdm-dashboard__axis-illustration" aria-hidden="true"><AxisIcon size={32} strokeWidth={2.2} /></div>
                <p className="pdm-dashboard__axis-description">{axisDescriptions[axisIndex]}</p>
                <div className="pdm-dashboard__axis-bottom">
                    <p className='border-y-[#d8dbde] border-y border-solid py-1 px-1.5 uppercase font-light'><strong>{axisCount ?? '—'}</strong> metas</p>
                    <p className='font-bold text-base'><span>orçamento:</span> {axisBudget.value}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
        <div className="pdm-dashboard__commitment">
            <span className="pdm-dashboard__commitment-icon">
                <CircleDollarSign size={20} aria-hidden="true" />
            </span>
            <p><strong>{committed.value}</strong> BI <span>recursos empenhados até setembro de 2026</span></p>
        </div>
      </div>
      <article className="pdm-dashboard__monitor">
        <header className="pdm-dashboard__monitor-header">
          <h2>Painel de monitoramento</h2><SlidersHorizontal size={18} aria-hidden="true" />
        </header>
        <div className="pdm-dashboard__monitor-grid">
          <div className="pdm-dashboard__monitor-stats">
            <div className="pdm-dashboard__stat"><strong>{more50.value}</strong><TrendingUp size={15} aria-hidden="true"/><span>Metas com mais de 50% de execução</span></div>
            <div className="pdm-dashboard__stat"><strong>{progress.value}</strong><TrendingUp size={15} aria-hidden="true"/><span>Metas em progresso e/ou atingidas</span></div>
            <div className="pdm-dashboard__stat"><strong>{actions.value}</strong><CheckCircle2 size={16} aria-hidden="true"/><span>Ações estratégicas concluídas <small>TOTAL: {totalActions.value}</small></span></div>
          </div>
          <div className="pdm-dashboard__monitor-right">
            <div className="pdm-dashboard__reached"><strong>{reached.value}</strong><CalendarCheck2 size={21} aria-hidden="true"/><span>Metas atingidas</span></div>
                <div className="pdm-dashboard__gauge">
                    <ExecutionGauge value={executionNumber} />
                    {execution.preview && (
                        <span className="pdm-dashboard__gauge-preview"></span>
                    )}
                </div>
          </div>
        </div>
      </article>
    </div>
  </section>
}
