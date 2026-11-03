import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MetaSummary } from '../api/metas.schemas'
import { metasContent } from '../data/metas.content'
import { sameName } from '../lib/metas.utils'
import './OverviewPanel.css'

type BudgetAxis = { nome: string; cor_principal?: string; qtd_metas?: number; orcamento?: number | string | null }
type BudgetResponse = { total_metas?: number; orcamento_total?: number | string | null; orcamentos_por_eixo?: BudgetAxis[] }
type Indicator = { nome: string; valor: string | number; ordem?: number }
type IndicatorsResponse = { list_conheca_metas?: Indicator[] }

// O backend antigo expõe /visao_geral/orcamento_geral e /visao_geral/conheca_metas.
// As URLs ficam configuráveis para reutilizar esse contrato sem fixar o legado no novo site.
const budgetUrl = (import.meta.env.VITE_METAS_OVERVIEW_BUDGET_URL as string | undefined)?.trim() || ''
const indicatorsUrl = (import.meta.env.VITE_METAS_OVERVIEW_INDICATORS_URL as string | undefined)?.trim() || ''

async function fetchOverview<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<T>
}

function money(value: number | string | null | undefined) {
  if (value === undefined || value === null || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return null
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(parsed)
}

interface Props { metas: MetaSummary[]; total: number }
export function OverviewPanel({ metas, total }: Props) {
  const [index, setIndex] = useState(0)
  const { data: budget, isError: budgetError } = useQuery({
    queryKey: ['pdm-v2', 'overview', 'budget', budgetUrl],
    queryFn: ({ signal }) => fetchOverview<BudgetResponse>(budgetUrl, signal),
    enabled: !!budgetUrl, staleTime: 120_000, retry: 1,
  })
  const { data: indicators, isError: indicatorsError } = useQuery({
    queryKey: ['pdm-v2', 'overview', 'indicators', indicatorsUrl],
    queryFn: ({ signal }) => fetchOverview<IndicatorsResponse>(indicatorsUrl, signal),
    enabled: !!indicatorsUrl, staleTime: 120_000, retry: 1,
  })

  const axis = metasContent.axes[index]
  const axisBudget = budget?.orcamentos_por_eixo?.find(item => sameName(item.nome, axis.name))
  const axisCount = metas.filter(meta => sameName(meta.eixo.nome, axis.name)).length
  const reached = metas.filter(meta => meta.monitoramento === 'atingida').length
  const inProgress = metas.filter(meta => ['atingida', 'progresso'].includes(meta.monitoramento ?? '')).length
  const byApi = (indicators?.list_conheca_metas ?? [])
    .filter(item => !sameName(item.nome, 'recursos empenhados'))
    .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
  const fallback: Indicator[] = [
    { nome: 'Metas atingidas', valor: reached },
    { nome: 'Metas com 50% ou mais de execução', valor: '—' },
    { nome: `${inProgress} metas em progresso e/ou atingidas`, valor: total ? `${Math.round(inProgress / total * 100)}%` : '—' },
    { nome: 'Execução total do PdM', valor: '—' },
  ]
  const tiles = byApi.length ? byApi.slice(0, 4) : fallback
  const totalBudget = money(budget?.orcamento_total)
  const perAxisBudget = money(axisBudget?.orcamento)

  return <section className="metas-overview" aria-label="Visão geral do Programa de Metas">
    <div className="metas-overview__card metas-overview__card--numbers">
      <div className="metas-overview__main">
        <div className="metas-overview__total">
          <h3 className="metas-overview__heading">Total de metas</h3>
          <strong className="metas-overview__total-value">{total || '—'}</strong>
          <p>Metas divididas em <strong>4 diferentes eixos</strong></p>
        </div>
        <div className="metas-overview__axes">
          <h3 className="metas-overview__heading">Metas por eixo</h3>
          <div className="metas-overview__axis-card" style={{ backgroundColor: axis.color }}>
            <span className="metas-overview__axis-name">{axis.name}</span>
            <div className="metas-overview__axis-carousel">
              <button type="button" onClick={() => setIndex(i => (i + metasContent.axes.length - 1) % metasContent.axes.length)} aria-label="Eixo anterior"><ChevronLeft /></button>
              <strong>{axisCount}</strong>
              <button type="button" onClick={() => setIndex(i => (i + 1) % metasContent.axes.length)} aria-label="Próximo eixo"><ChevronRight /></button>
            </div>
            <span className="metas-overview__axis-budget"><strong>Orçamento por eixo:</strong> {perAxisBudget ?? 'aguardando API'}</span>
          </div>
        </div>
      </div>
      <p className="metas-overview__budget-total"><strong>Orçamento total:</strong> {totalBudget ?? 'aguardando API'}</p>
    </div>
    <div className="metas-overview__card metas-overview__card--progress">
      <h3 className="metas-overview__heading">Andamento das metas</h3>
      <div className="metas-overview__indicators">
        {tiles.map((item, i) => <div className="metas-overview__indicator" key={`${item.nome}-${i}`}>
          <strong>{item.valor}</strong><span>{item.nome}</span>
        </div>)}
      </div>
      {(!budgetUrl || !indicatorsUrl || budgetError || indicatorsError) && <p className="metas-overview__status" role="status">
        {budgetError || indicatorsError ? 'A consulta de indicadores/orçamento falhou. Confira a URL e o proxy configurados.' : 'Valores consolidados de orçamento e execução dependem da API de visão geral.'}
      </p>}
    </div>
  </section>
}
