import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import type { MetaDetail, MetaSummary } from '../api/metas.schemas'
import { useMeta } from '../hooks/useMetas'
import OriginalMetaModal from './legacy/MetaModal.jsx'
import './MetaModalFullscreen.css'

type LegacyAction = {
  numero: string
  descricao: string
  concluida: boolean
  evolucao_negrito: string
  descricao_evolucao: string
}

function legacyActions(detail: MetaDetail): LegacyAction[] {
  return detail.acoes_estrategicas.flatMap((raw, index) => {
    if (typeof raw === 'string') {
      return [{ numero: String(index + 1), descricao: raw, concluida: false, evolucao_negrito: '', descricao_evolucao: '' }]
    }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return []
    const value = raw as Record<string, unknown>
    const str = (key: string): string => typeof value[key] === 'string' ? String(value[key]) : ''
    return [{
      numero: str('numero') || String(index + 1),
      descricao: str('descricao') || str('titulo') || str('nome'),
      concluida: value.concluida === true,
      evolucao_negrito: str('evolucao_negrito'),
      descricao_evolucao: str('descricao_evolucao') || str('evolucao'),
    }]
  })
}

function toLegacyData(summary: MetaSummary, detail: MetaDetail) {
  const monitor = detail.monitoramento && typeof detail.monitoramento === 'object'
    ? detail.monitoramento
    : null
  const status = monitor?.status ?? (typeof detail.monitoramento === 'string' ? detail.monitoramento : summary.monitoramento) ?? 'planejamento'
  const blocks = detail.regionalizacao?.blocos ?? []
  const planned = blocks.find(b => /planej|planned/i.test(`${b.chave ?? ''} ${b.titulo ?? ''}`)) ?? blocks[0]
  const executed = blocks.find(b => /execut|executed/i.test(`${b.chave ?? ''} ${b.titulo ?? ''}`)) ?? blocks[1]
  const regionalized = summary.regionalizada
  const resultList = (monitor?.resultados_apurados ?? []).map(r => ({
    mes: r.mes ?? '',
    ano: r.ano ?? '',
    resultados_apurados_value: r.valor,
  }))
  const titleParts = {
    strongText: summary.titulo_destaque || summary.titulo,
    normalText: summary.titulo_complemento || '',
  }
  return {
    id: summary.codigo,
    listing: { titulo: summary.titulo, titleParts },
    card: {
      numero: summary.numero,
      eixo_nome: detail.eixo.nome,
      eixo_cor_principal: detail.eixo.cor_principal || summary.eixo.cor_principal || '#3DB54A',
      eixo_cor_secundaria: detail.eixo.cor_secundaria || summary.eixo.cor_secundaria || '#288140',
      eixo_frase: detail.eixo.frases ?? summary.eixo.frases ?? [],
      monitoramento: status,
      projecao: detail.projecao ? { titulo: 'Projeção', valor: detail.projecao } : null,
      orgaos_responsaveis: { valor: detail.orgaos_responsaveis ?? [] },
      acoes_estrategicas: { valor: legacyActions(detail) },
      resultados_apurados: { valor: resultList },
      indicador: { valor: monitor?.indicador || '' },
      evolucao: monitor?.evolucao || '',
      regionalizacao_metamap: {
        status_regionalizacao: regionalized ? 'Regionalizável' : 'Não regionalizável',
        nota_regionalizacao: detail.regionalizacao?.nota ?? '',
      },
      regionalizacao_planejado: {
        map_image: planned?.imagem || null,
        map_legenda: planned?.rodape || planned?.texto || '',
      },
      regionalizacao_executado: {
        map_image: executed?.imagem || null,
        map_legenda: executed?.rodape || executed?.texto || '',
      },
    },
  }
}

export function MetaModal({ summary, onClose }: { summary: MetaSummary | null; onClose: () => void }) {
  const { data: detail, isPending, error } = useMeta(summary?.codigo ?? null)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!summary) return
    const lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => { document.body.style.overflow = previousOverflow; lastFocus?.focus() }
  }, [summary])

  if (!summary) return null
  const legacyMeta = detail ? toLegacyData(summary, detail) : null

  function onKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const all = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),[tabindex="0"]')
    const items = Array.from(all ?? []).filter(el => el.getClientRects().length > 0)
    if (!items.length) return
    if (event.shiftKey && document.activeElement === items[0]) {
      event.preventDefault()
      items[items.length - 1].focus()
    } else if (!event.shiftKey && document.activeElement === items[items.length - 1]) {
      event.preventDefault()
      items[0].focus()
    }
  }

  return createPortal(
    <div
      className="pdm-meta-legacy__fullscreen"
      role="dialog"
      aria-modal="true"
      aria-label={`Detalhes da meta ${summary.numero}`}
      tabIndex={-1}
      ref={dialogRef}
      onKeyDown={onKeys}
    >
      {isPending ? (
        <div className="p-12 text-center">Carregando informações da Meta {summary.numero}…</div>
      ) : error ? (
        <div className="p-12 text-center" role="alert">
          <p>Não foi possível carregar os detalhes desta meta.</p>
          <button type="button" onClick={onClose} className="mt-4 underline">Voltar</button>
        </div>
      ) : !legacyMeta ? (
        <div className="p-12 text-center">Dados indisponíveis.</div>
      ) : (
        <OriginalMetaModal key={summary.codigo} meta={legacyMeta} onClose={onClose} />
      )}
    </div>,
    document.body,
  )
}
