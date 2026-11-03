import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useMeta } from '../hooks/useMetas'
import { axisColor } from '../lib/metas.utils'
import type { MetaSummary } from '../api/metas.schemas'
type Tab = 'overview' | 'monitoring' | 'works' | 'territory' | 'budget'
const tabs: [Tab, string][] = [
  ['overview', 'Visão geral'],
  ['monitoring', 'Monitoramento'],
  ['works', 'Obras e projetos'],
  ['territory', 'Regionalização'],
  ['budget', 'Orçamento'],
]
const safeImage = (url: string | undefined | null) => (url?.startsWith('https://') ? url : null)
export function MetaModal({
  summary,
  onClose,
}: {
  summary: MetaSummary | null
  onClose: () => void
}) {
  const { data: detail, isPending, error } = useMeta(summary?.codigo ?? null)
  const [selection, setSelection] = useState<{ code: string; tab: Tab }>({
    code: '',
    tab: 'overview',
  })
  const activeTab = selection.code === summary?.codigo ? selection.tab : 'overview'
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!summary) return
    const previous = document.body.style.overflow
    const prior = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = previous
      prior?.focus()
    }
  }, [summary])
  if (!summary) return null
  function keys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
    if (event.key !== 'Tab') return
    const nodes = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]'),
    ).filter((n) => n.offsetParent !== null)
    if (!nodes.length) return
    if (event.shiftKey && document.activeElement === nodes[0]) {
      event.preventDefault()
      nodes[nodes.length - 1].focus()
    } else if (!event.shiftKey && document.activeElement === nodes[nodes.length - 1]) {
      event.preventDefault()
      nodes[0].focus()
    }
  }
  const monitor =
    detail?.monitoramento && typeof detail.monitoramento === 'object' ? detail.monitoramento : null
  return createPortal(
    <div
      className="metas-modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="metas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meta-modal-title"
        onKeyDown={keys}
      >
        <header className="metas-modal__header">
          <div>
            <span className="metas-modal__eyebrow" style={{ backgroundColor: axisColor(summary) }}>
              {summary.eixo.nome}
            </span>
            <h2 id="meta-modal-title" className="font-display">
              META {summary.numero}
            </h2>
            <p>{summary.titulo}</p>
          </div>
          <button
            className="metas-modal__close"
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
          >
            <X />
          </button>
        </header>
        <div role="tablist" className="metas-modal__tabs">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={activeTab === key}
              onClick={() => setSelection({ code: summary.codigo, tab: key })}
              className={activeTab === key ? 'metas-modal__tab--active' : ''}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="metas-modal__content" role="tabpanel">
          {isPending ? (
            <p>Carregando dados completos…</p>
          ) : error ? (
            <p role="alert">Não foi possível carregar os detalhes: {error.message}</p>
          ) : !detail ? (
            <p>Sem dados.</p>
          ) : (
            <>
              {activeTab === 'overview' && (
                <>
                  <section className="metas-modal__section">
                    <h3>Projeção</h3>
                    <p>{detail.projecao || 'Não informada'}</p>
                  </section>
                  <section className="metas-modal__section">
                    <h3>Órgãos responsáveis</h3>
                    <p>{detail.orgaos_responsaveis.join(', ') || 'Não informados'}</p>
                  </section>
                  <section className="metas-modal__section">
                    <h3>Eixo</h3>
                    {detail.eixo.frases.map((text, i) => (
                      <p key={i}>{text}</p>
                    ))}
                  </section>
                </>
              )}
              {activeTab === 'monitoring' && (
                <>
                  <section className="metas-modal__section">
                    <h3>Monitoramento</h3>
                    <p>{monitor?.status || detail.status_smae?.andamento || 'Não informado'}</p>
                    <p>{detail.status_smae?.situacao || ''}</p>
                    <p>{detail.status_smae?.previsao || ''}</p>
                  </section>
                  <section className="metas-modal__section">
                    <h3>Indicador</h3>
                    <p>{monitor?.indicador || 'Não informado'}</p>
                    <p className="whitespace-pre-line">{monitor?.evolucao || ''}</p>
                    {monitor?.resultados_apurados.map((r, i) => (
                      <p key={i}>
                        {r.mes}/{r.ano}: {r.valor}
                      </p>
                    ))}
                  </section>
                </>
              )}
              {activeTab === 'works' && (
                <>
                  <section className="metas-modal__section">
                    <h3>Obras associadas ({detail.obras_associadas.length})</h3>
                    {detail.obras_associadas.map((obra, i) => (
                      <article key={obra.codigo || i} className="metas-modal__action">
                        <strong>{obra.nome}</strong>
                        <p>
                          {obra.codigo} ·{' '}
                          {obra.subprefeitura ||
                            obra.subprefeituras?.join(', ') ||
                            'Local não informado'}
                        </p>
                        <p>
                          {obra.status || 'Status não informado'} ·{' '}
                          {obra.percentual_concluido == null
                            ? 'Percentual não informado'
                            : `${obra.percentual_concluido}%`}
                        </p>
                      </article>
                    ))}
                  </section>
                  <section className="metas-modal__section">
                    <h3>Projetos associados ({detail.projetos_associados.length})</h3>
                    {detail.projetos_associados.map((p, i) => (
                      <p key={p.codigo || i}>
                        {p.nome} · {p.etapa || ''}
                      </p>
                    ))}
                  </section>
                </>
              )}
              {activeTab === 'territory' && (
                <>
                  <section className="metas-modal__section">
                    <h3>Territórios informados</h3>
                    <p>
                      {detail.territorios?.subprefeituras.join(', ') ||
                        summary.subprefeituras.join(', ') ||
                        'Sem territórios cadastrados'}
                    </p>
                    <p>O mapa representa territórios administrativos, não o endereço das obras.</p>
                  </section>
                  {detail.regionalizacao?.blocos?.map((block, i) => (
                    <section key={i} className="metas-modal__section">
                      <h3>{block.titulo || 'Mapa de regionalização'}</h3>
                      {safeImage(block.imagem) && (
                        <img
                          loading="lazy"
                          className="metas-modal__legacy-map"
                          src={safeImage(block.imagem)!}
                          alt={block.titulo || 'Mapa de regionalização'}
                        />
                      )}
                      <p>{block.texto || ''}</p>
                    </section>
                  ))}
                </>
              )}
              {activeTab === 'budget' && (
                <section className="metas-modal__section">
                  <h3>Orçamento</h3>
                  <p>Previsão: {detail.orcamento?.previsao || 'Não informada'}</p>
                  <p>Empenhado: {detail.orcamento?.empenhado || 'Não informado'}</p>
                  <p>Liquidado: {detail.orcamento?.liquidado || 'Não informado'}</p>
                  {detail.orcamento?.atualizado_em && (
                    <p>
                      Atualizado em:{' '}
                      {new Date(detail.orcamento.atualizado_em).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
