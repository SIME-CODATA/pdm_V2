import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMascaraGeojson, getMetaPublishedGeojson, getSubprefeiturasGeojson } from '../api/metas.repository'
import { useMetas, useMetaMapPayload } from '../hooks/useMetas'
import { getPublishedPoints, getTerritories, territoryKey, territoryName, territoryForPoint } from '../map/metas.geo'
import { searchMatches, sameName } from '../lib/metas.utils'
import type { MetaSummary } from '../api/metas.schemas'
import { MetaCard } from '../components/MetaCard'
import { MetaModal } from '../components/MetaModal'
import { MetasFilters } from '../components/MetasFilters'
import { OverviewPanel } from '../components/OverviewPanel'
import { metasContent } from '../data/metas.content'
import './MetasPage.css'
import './MetasPresentation.css'
import './MetasRework.css'

const MetasMapView = lazy(() =>import('../map/MetasMap').then(module => ({ default: module.MetasMap })))
const NO_METAS: MetaSummary[] = []

// A rota do mapa geral deve trazer GeoJSON público; se não trouxer, utilizamos
// SOMENTE endpoints /fontes/geojson, com concorrência controlada e cache de query.
async function loadPublishedIndividual(metas: MetaSummary[], signal: AbortSignal): Promise<{ raw: unknown[]; errors: number }> {
  const eligible = metas.filter(meta => meta.regionalizada)
  const raw: unknown[] = []
  let index = 0
  let errors = 0
  await Promise.all(Array.from({ length: Math.min(4, eligible.length) }, async () => {
    while (index < eligible.length && !signal.aborted) {
      const meta = eligible[index++]
      try {
        const payload = await getMetaPublishedGeojson(meta.codigo, signal)
        raw.push({ codigo: meta.codigo, mapa: payload })
      } catch (error) {
        if (signal.aborted) return
        errors++
        // Um endpoint individual indisponível não impede a exibição dos demais.
        console.warn('GeoJSON público indisponível para a meta', meta.codigo, error)
      }
    }
  }))
  return { raw, errors }
}

export function MetasPage() {
  const [axis, setAxis] = useState('')
  const [search, setSearch] = useState('')
  const [territory, setTerritory] = useState<string | null>(null)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [activeCode, setActiveCode] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data, error, isPending, refetch } = useMetas()
  const mapPayload = useMetaMapPayload()
  const subprefPayload = useQuery({
    queryKey: ['pdm-v2', 'geo', 'subprefeituras', 'api'],
    queryFn: ({ signal }) => getSubprefeiturasGeojson(signal),
    staleTime: 30 * 60_000, retry: 1,
  })
  const maskPayload = useQuery({
    queryKey: ['pdm-v2', 'geo', 'mascara', 'api'],
    queryFn: ({ signal }) => getMascaraGeojson(signal),
    staleTime: 30 * 60_000, retry: 0,
  })

  const metas = data?.metas ?? NO_METAS
  const territories = useMemo(() => getTerritories(subprefPayload.data), [subprefPayload.data])
  const allPublishedPoints = useMemo(() => getPublishedPoints(mapPayload.data, metas), [mapPayload.data, metas])
  const explicitNotPublished = (mapPayload.data as { metadata?: { fonte_publicada?: boolean } } | undefined)
    ?.metadata?.fonte_publicada === false
  const missingGlobalPoints = !!mapPayload.data && allPublishedPoints.length === 0
  const individual = useQuery({
    queryKey: ['pdm-v2', 'geo', 'individual', metas.map(meta => meta.codigo).join(',')],
    queryFn: ({ signal }) => loadPublishedIndividual(metas, signal),
    enabled: !!metas.length && missingGlobalPoints && !explicitNotPublished,
    staleTime: 15 * 60_000, retry: 0,
  })
  const points = useMemo(() => {
    if (allPublishedPoints.length) return allPublishedPoints
    return getPublishedPoints({ items: individual.data?.raw }, metas)
  }, [allPublishedPoints, individual.data, metas])

  const filtered = useMemo(() => metas.filter(meta =>
    searchMatches(meta, search) && (!axis || sameName(meta.eixo.nome, axis))), [metas, axis, search])
  const byCode = useMemo(() => {
    const codes = new Map<string, Set<string>>()
    for (const point of points) {
      const key = territoryForPoint(point.position, territories.features)
      if (!key) continue
      const list = codes.get(point.code) ?? new Set<string>()
      list.add(key)
      codes.set(point.code, list)
    }
    return codes
  }, [points, territories.features])
  const selectedName = territory ? territories.features.find(f => f.properties.pdmKey === territory) : undefined
  const selectedTerritoryName = selectedName ? territoryName(selectedName) : ''

  const regionalMetas = useMemo(() => territory ? filtered.filter(meta => meta.regionalizada && (
    meta.subprefeituras.some(name => territoryKey(name) === territory) ||
    !!byCode.get(meta.codigo)?.has(territory)
  )) : [], [filtered, territory, byCode])
  const generalMetas = useMemo(() => territory ? filtered.filter(meta => !meta.regionalizada) : [],
    [filtered, territory])
  const shown = territory ? [...regionalMetas, ...generalMetas] : filtered
  const numberWithPoints = useMemo(() => new Set(points.map(point => point.code)), [points])

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = 0 }, [territory, axis, search])

  function selectPoint(code: string) {
    setActiveCode(code)
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-meta-code="${code}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }
  function openMeta(code: string) {
    setActiveCode(code)
    setSelectedCode(code)
  }
  function renderMeta(meta: MetaSummary) {
    const aggregated = territory && meta.regionalizada &&
      meta.subprefeituras.some(name => territoryKey(name) === territory) &&
      !byCode.get(meta.codigo)?.has(territory)
    return <div key={meta.codigo} className="metas-rework__card-row">
      {aggregated && <span className="metas-rework__chip metas-rework__chip--aggregated"
        title="Meta vinculada à região, sem ponto público específico">Agregada</span>}
      <MetaCard meta={meta} selected={meta.codigo === activeCode} onOpen={openMeta} />
    </div>
  }

  return <div className="metas-page metas-page--rework">
    {/* Painel permanente definido na revisão anterior: continua acima do mapa. */}
    <OverviewPanel metas={metas} total={data?.total ?? metas.length} />

    <section className="metas-rework" aria-labelledby="metas-rework-title">
      <header className="metas-rework__heading">
        <h1 id="metas-rework-title">VISUALIZAÇÃO REGIONALIZADA</h1>
        <p>Aqui você encontra todas as metas do Programa.<br />
          Use o filtro ao lado ou clique nas regiões do mapa<br />
          para navegar. Clique na meta para ver mais detalhes.</p>
      </header>
      <div className="metas-rework__workspace">
        <section className="metas-rework__map" aria-label="Visualização territorial de São Paulo">
          <div className="metas-rework__map-body">
            <Suspense fallback={<div className="metas-page__map-loading">Carregando mapa...</div>}>
              <MetasMapView features={territories.features} points={points} visibleCodes={filtered.map(m => m.codigo)}
                mask={maskPayload.data} axis={axis} territory={territory}
                onTerritory={setTerritory} onSelectMeta={selectPoint} />
            </Suspense>
            {territory && <button type="button" className="metas-rework__back"
              onClick={() => setTerritory(null)}>← Ver São Paulo inteira</button>}
          </div>
          {!!subprefPayload.data && territories.features.length === 0 && <p className="metas-rework__notice" role="alert">
            A camada da API não contém polígonos identificáveis em EPSG:4326. Confira o GeoJSON público das subprefeituras.
          </p>}
          {subprefPayload.isError && <p className="metas-rework__notice" role="alert">
            Não foi possível carregar o mapa das subprefeituras: {subprefPayload.error?.message}
          </p>}
          {mapPayload.isError && <p className="metas-rework__notice">
            O serviço de localizações do mapa está indisponível. {mapPayload.error?.message}
          </p>}
          {!mapPayload.isPending && !points.length && !individual.isFetching && !subprefPayload.isPending &&
            <p className="metas-rework__notice">Ainda não há pontos públicos autorizados para exibição neste mapa.</p>}
          {individual.isFetching && <p className="metas-rework__notice">Consultando localizações públicas das metas...</p>}
          {individual.data && individual.data.errors > 0 && <p className="metas-rework__notice">
            Alguns registros geográficos não puderam ser consultados ({individual.data.errors}).
          </p>}
        </section>

        <aside className="metas-rework__sidebar" aria-label="Filtros e lista das metas">
          <MetasFilters metas={metas} features={territories.features} search={search} axis={axis}
            territory={territory} onSearch={setSearch} onAxis={setAxis} onTerritory={setTerritory} />
          <div className="metas-rework__count" role="status">
            {shown.length} {shown.length === 1 ? 'meta' : 'metas'} {territory ? `· ${selectedTerritoryName}` : '· São Paulo'}
            {numberWithPoints.size > 0 && !territory && <span> · {numberWithPoints.size} com pontos públicos</span>}
          </div>
          <div className="metas-page__list metas-rework__list" ref={listRef}>
            {isPending ? <p className="metas-page__feedback">Consultando API de metas...</p> :
              error ? <div className="metas-page__feedback" role="alert">
                <p>{error.message}</p><button type="button" onClick={() => void refetch()}>Tentar novamente</button>
              </div> : territory ? <>
                <div className="metas-rework__group-title">Metas de {selectedTerritoryName || 'subprefeitura'}</div>
                {regionalMetas.length ? regionalMetas.map(renderMeta) :
                  <p className="metas-page__feedback">Nenhuma meta regionalizada corresponde aos filtros nesta região.</p>}
                <div className="metas-rework__separator"><span>Metas gerais, não regionalizáveis</span></div>
                {generalMetas.length ? generalMetas.map(renderMeta) :
                  <p className="metas-page__feedback">Nenhuma meta geral corresponde aos filtros selecionados.</p>}
              </> : shown.length ? shown.map(renderMeta) :
                <p className="metas-page__feedback">{metasContent.noResults}</p>}
          </div>
        </aside>
      </div>
      <div className="metas-rework__legend">
        <p><span className="metas-rework__chip metas-rework__chip--general">Não regionalizável</span>
          Metas que se aplicam à cidade como um todo.</p>
        <p><span className="metas-rework__chip metas-rework__chip--aggregated">Agregadas</span>
          Metas que se aplicam às regiões, mas sem endereço público específico.</p>
      </div>
    </section>
    {/* O card e o modal original são preservados sem modificações. */}
    <MetaModal summary={metas.find(meta => meta.codigo === selectedCode) ?? null}
      onClose={() => setSelectedCode(null)} />
  </div>
}
export default MetasPage
