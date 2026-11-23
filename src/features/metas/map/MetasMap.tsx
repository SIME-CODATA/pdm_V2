import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { metasContent } from '../data/metas.content'
import { simplifyPdmBasemap } from './metas.basemap'
import { spreadOverlappingPins } from './metas.spiderfy'
import type { MapPinFeature } from './metas.spiderfy'
import type { PublishedPoint, TerritoryFeature, GeographicBounds } from './metas.geo'
import { allBounds, asPolygonCollection, featureBounds, validBounds, territoryKey, territoryForPoint } from './metas.geo'
import './MetasMap.css'

maplibregl.setWorkerUrl(workerUrl)

interface Props {
  features: TerritoryFeature[]
  points: PublishedPoint[]
  visibleCodes: string[]
  mask: unknown
  axis: string
  territory: string | null
  onTerritory: (key: string) => void
  onSelectMeta: (code: string) => void
}

const SP_FALLBACK: GeographicBounds = { west: -46.85, east: -46.34, south: -24.02, north: -23.35 }
const asMapBounds = (b: GeographicBounds): [[number, number], [number, number]] =>
  [[b.west, b.south], [b.east, b.north]]
const asGeo = <T,>(data: T) => data as unknown as Parameters<maplibregl.GeoJSONSource['setData']>[0]
const EMPTY = { type: 'FeatureCollection' as const, features: [] as never[] }

// Apenas uma camada de acabamento: não substitui o mapa-base nem altera a geografia.
const OVERVIEW_COVER = {
  type: 'Feature' as const,
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[[-48, -25], [-45, -25], [-45, -22], [-48, -22], [-48, -25]]],
  },
  properties: {},
}

export function MetasMap({ features, points, visibleCodes, mask, axis, territory, onTerritory, onSelectMeta }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const initialized = useRef(false)
  const frameKey = useRef('')
  const current = useRef({ territory, onTerritory, onSelectMeta })
  current.current = { territory, onTerritory, onSelectMeta }

  const pointFeatures = useMemo<MapPinFeature[]>(() => points.flatMap(point => {
    const key = territoryForPoint(point.position, features)
    return key ? [{
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: point.position },
      properties: { code: point.code, number: point.number, color: point.color,
        axis: point.axis, key, id: point.id },
    }] : []
  }), [points, features])

  const filteredPoints = useMemo(() => {
    const selected = new Set(visibleCodes)
    return pointFeatures.filter(point => selected.has(point.properties.code) &&
      (!axis || point.properties.axis === axis))
  }, [pointFeatures, visibleCodes, axis])

  // Funções sempre atuais para os eventos do MapLibre (sem recriar o mapa a cada filtro).
  const renderPinsRef = useRef<() => void>(() => {})
  renderPinsRef.current = () => {
    const map = mapRef.current
    if (!map || !initialized.current) return
    const dots = map.getSource('pdm-public-points') as maplibregl.GeoJSONSource | undefined
    if (dots) dots.setData(asGeo({ type: 'FeatureCollection', features: filteredPoints }))
    const numberSource = map.getSource('pdm-detail-points') as maplibregl.GeoJSONSource | undefined
    const lineSource = map.getSource('pdm-pin-leaders') as maplibregl.GeoJSONSource | undefined
    const anchorSource = map.getSource('pdm-pin-anchors') as maplibregl.GeoJSONSource | undefined
    if (!numberSource || !lineSource || !anchorSource) return
    const local = territory ? filteredPoints.filter(point => point.properties.key === territory) : []
    const spread = local.length ? spreadOverlappingPins(local,
      coords => map.project(coords), coords => map.unproject(coords)) : null
    numberSource.setData(asGeo({ type: 'FeatureCollection', features: spread?.pins ?? [] }))
    lineSource.setData(asGeo({ type: 'FeatureCollection', features: spread?.leaders ?? [] }))
    anchorSource.setData(asGeo({ type: 'FeatureCollection', features: spread?.anchors ?? [] }))
  }

  const applyCamera = useCallback((animate = true) => {
    const map = mapRef.current
    const holder = container.current
    if (!map || !initialized.current || !holder || holder.clientWidth < 50 || holder.clientHeight < 50) return
    const feature = territory ? features.find(item => item.properties.pdmKey === territory) : undefined
    const selection = feature ? featureBounds(feature) : null
    const isRegion = validBounds(selection)
    const cityBounds = allBounds(features)
    const bounds = isRegion ? selection : validBounds(cityBounds) ? cityBounds : SP_FALLBACK
    const key = [territory || 'cidade', bounds.west, bounds.south, bounds.east, bounds.north,
      holder.clientWidth, holder.clientHeight].join(':')
    if (frameKey.current === key) return
    frameKey.current = key

    if (isRegion) {
      // Enquadramento por geometria: mostra o território inteiro sem aplicar zoom
      // artificial que corte as bordas. maxZoom alto permite ampliar os menores.
      const camera = map.cameraForBounds(asMapBounds(bounds), {
        padding: { top: 24, right: 24, bottom: 24, left: 24 },
        maxZoom: 15,
      })
      if (camera && typeof camera.zoom === 'number' && Number.isFinite(camera.zoom)) {
        map.easeTo({ center: camera.center, zoom: camera.zoom,
          duration: animate ? 650 : 0 })
      }
    } else {
      map.fitBounds(asMapBounds(bounds), { padding: 24, duration: animate ? 450 : 0 })
    }
  }, [features, territory])
  const applyCameraRef = useRef(applyCamera)
  applyCameraRef.current = applyCamera

  useEffect(() => {
    if (!container.current) return
    const map = new maplibregl.Map({
      container: container.current,
      style: metasContent.mapStyle,
      bounds: asMapBounds(SP_FALLBACK),
      fitBoundsOptions: { padding: 20 },
      attributionControl: {},
      dragPan: false, dragRotate: false, scrollZoom: false,
      boxZoom: false, doubleClickZoom: false, keyboard: false, touchZoomRotate: false,
    })
    mapRef.current = map
    initialized.current = false
    frameKey.current = ''

    const clickedTerritory = (e: maplibregl.MapLayerMouseEvent) => {
      // Um pin numerado tem prioridade sobre a camada invisível de territórios.
      if (current.current.territory && map.queryRenderedFeatures(e.point, {
        layers: ['pdm-public-numbered'],
      }).length) return
      const props = e.features?.[0]?.properties
      const key = typeof props?.pdmKey === 'string' ? props.pdmKey : territoryKey(String(props?.nome || ''))
      if (key) current.current.onTerritory(key)
    }
    const clickedDetailPoint = (e: maplibregl.MapLayerMouseEvent) => {
      const code = e.features?.[0]?.properties?.code
      if (typeof code === 'string' && current.current.territory) current.current.onSelectMeta(code)
    }
    const hoverOn = () => { map.getCanvas().style.cursor = 'pointer' }
    const hoverOff = () => { map.getCanvas().style.cursor = '' }
    const afterMovement = () => renderPinsRef.current()

    const loaded = () => {
      simplifyPdmBasemap(map)
      // No modo cidade, cobrir todos os nomes e ruas com cinza claro.
      // Na subprefeitura selecionada esta cobertura desaparece.
      map.addSource('pdm-overview-cover-source', { type: 'geojson', data: asGeo(OVERVIEW_COVER) })
      map.addLayer({ id: 'pdm-overview-cover', type: 'fill', source: 'pdm-overview-cover-source',
        paint: { 'fill-color': '#F1F2F3', 'fill-opacity': 1 } })
      map.addSource('pdm-regions', { type: 'geojson', data: asGeo(EMPTY) })
      map.addLayer({ id: 'pdm-area-fill', type: 'fill', source: 'pdm-regions',
        paint: { 'fill-color': '#A7ABB1', 'fill-opacity': 0.30 } })
      // No detalhe, o restante da cidade recebe um véu muito leve. No mapa
      // inteiro ele fica oculto, preservando 100% do visual já aprovado.
      map.addLayer({ id: 'pdm-neighbor-veil', type: 'fill', source: 'pdm-regions',
        filter: ['!=', ['get', 'pdmKey'], ''],
        layout: { visibility: 'none' },
        paint: { 'fill-color': '#F2F3F5', 'fill-opacity': 0.36 } })
      map.addLayer({ id: 'pdm-region-selected', type: 'fill', source: 'pdm-regions',
        filter: ['==', ['get', 'pdmKey'], ''],
        paint: { 'fill-color': '#93C5E0', 'fill-opacity': .12 } })
      map.addLayer({ id: 'pdm-region-border', type: 'line', source: 'pdm-regions',
        paint: { 'line-color': '#596168', 'line-width': 1.35, 'line-opacity': .9 } })
      // Halo suavemente desfocado + traço nítido para destacar a borda real.
      map.addLayer({ id: 'pdm-selected-border-halo', type: 'line', source: 'pdm-regions',
        filter: ['==', ['get', 'pdmKey'], ''], layout: { visibility: 'none' },
        paint: { 'line-color': '#FFFFFF', 'line-width': 7,
          'line-opacity': .86, 'line-blur': 1.4 } })
      map.addLayer({ id: 'pdm-selected-border', type: 'line', source: 'pdm-regions',
        filter: ['==', ['get', 'pdmKey'], ''], layout: { visibility: 'none' },
        paint: { 'line-color': '#3F4853', 'line-width': 3.3, 'line-opacity': 1 } })
      map.addLayer({ id: 'pdm-region-hit', type: 'fill', source: 'pdm-regions',
        paint: { 'fill-color': '#FFFFFF', 'fill-opacity': 0.005 } })
      map.addSource('pdm-exterior-mask', { type: 'geojson', data: asGeo(EMPTY) })
      map.addLayer({ id: 'pdm-exterior-fill', type: 'fill', source: 'pdm-exterior-mask',
        paint: { 'fill-color': '#F2F3F4', 'fill-opacity': 1 } }, 'pdm-area-fill')
      map.addSource('pdm-public-points', { type: 'geojson', data: asGeo(EMPTY) })
      map.addLayer({ id: 'pdm-public-dots', type: 'circle', source: 'pdm-public-points',
        paint: { 'circle-color': ['get', 'color'], 'circle-radius': 3.5,
          'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 0.4 } })
      map.addSource('pdm-pin-leaders', { type: 'geojson', data: asGeo(EMPTY) })
      map.addLayer({ id: 'pdm-pin-leaders-layer', type: 'line', source: 'pdm-pin-leaders',
        paint: { 'line-color': '#5F666D', 'line-width': 1, 'line-opacity': .6 } })
      map.addSource('pdm-pin-anchors', { type: 'geojson', data: asGeo(EMPTY) })
      map.addLayer({ id: 'pdm-pin-anchors-layer', type: 'circle', source: 'pdm-pin-anchors',
        paint: { 'circle-color': '#596168', 'circle-radius': 2, 'circle-opacity': .7 } })
      map.addSource('pdm-detail-points', { type: 'geojson', data: asGeo(EMPTY) })
      map.addLayer({ id: 'pdm-public-numbered', type: 'circle', source: 'pdm-detail-points',
        layout: { visibility: 'none' },
        paint: { 'circle-color': ['get', 'color'], 'circle-radius': 12,
          'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 } })
      map.addLayer({ id: 'pdm-public-numbers', type: 'symbol', source: 'pdm-detail-points',
        layout: { visibility: 'none', 'text-field': ['get', 'number'], 'text-size': 11,
          'text-allow-overlap': true, 'text-ignore-placement': true },
        paint: { 'text-color': '#FFFFFF' } })

      map.on('click', 'pdm-region-hit', clickedTerritory)
      map.on('click', 'pdm-public-numbered', clickedDetailPoint)
      map.on('mouseenter', 'pdm-region-hit', hoverOn)
      map.on('mouseleave', 'pdm-region-hit', hoverOff)
      map.on('mouseenter', 'pdm-public-numbered', hoverOn)
      map.on('mouseleave', 'pdm-public-numbered', hoverOff)
      map.on('moveend', afterMovement)
      initialized.current = true
      // Os dados podem ter chegado antes do style.load. Inicializar já com os dados atuais.
      applyCameraRef.current(false)
    }
    map.on('load', loaded)

    // O ResizeObserver detecta quando o layout/CSS e o painel lateral terminam
    // de ajustar o espaço. Não é necessário atualizar o navegador para redesenhar.
    let frame: number | null = null
    const observer = new ResizeObserver(() => {
      if (frame !== null) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        frame = null
        if (mapRef.current !== map || !container.current) return
        if (!container.current.clientWidth || !container.current.clientHeight) return
        map.resize()
        if (initialized.current && !map.isMoving()) {
          frameKey.current = ''
          applyCameraRef.current(false)
        }
      })
    })
    observer.observe(container.current)

    return () => {
      observer.disconnect()
      if (frame !== null) cancelAnimationFrame(frame)
      map.off('load', loaded)
      map.off('moveend', afterMovement)
      if (map.getLayer('pdm-region-hit')) {
        map.off('click', 'pdm-region-hit', clickedTerritory)
        map.off('mouseenter', 'pdm-region-hit', hoverOn)
        map.off('mouseleave', 'pdm-region-hit', hoverOff)
      }
      if (map.getLayer('pdm-public-numbered')) {
        map.off('click', 'pdm-public-numbered', clickedDetailPoint)
        map.off('mouseenter', 'pdm-public-numbered', hoverOn)
        map.off('mouseleave', 'pdm-public-numbered', hoverOff)
      }
      initialized.current = false
      map.remove()
      mapRef.current = null
      frameKey.current = ''
    }
  }, [])

  // As fontes oficiais são independentes: cada uma pode carregar em um momento diferente.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !initialized.current) {
      const onLoad = () => {
        const source = map?.getSource('pdm-regions') as maplibregl.GeoJSONSource | undefined
        source?.setData(asGeo({ type: 'FeatureCollection', features }))
        applyCameraRef.current(false)
      }
      map?.once('load', onLoad)
      return () => { map?.off('load', onLoad) }
    }
    const source = map.getSource('pdm-regions') as maplibregl.GeoJSONSource | undefined
    source?.setData(asGeo({ type: 'FeatureCollection', features }))
    applyCameraRef.current()
  }, [features])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const sync = () => {
      (map.getSource('pdm-exterior-mask') as maplibregl.GeoJSONSource | undefined)
        ?.setData(asGeo(asPolygonCollection(mask)))
    }
    if (initialized.current) sync()
    else map.once('load', sync)
    return () => { map.off('load', sync) }
  }, [mask])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const sync = () => {
      if (!initialized.current) return
      map.setLayoutProperty('pdm-overview-cover', 'visibility', territory ? 'none' : 'visible')
      map.setLayoutProperty('pdm-public-dots', 'visibility', territory ? 'none' : 'visible')
      for (const id of ['pdm-public-numbered', 'pdm-public-numbers',
        'pdm-pin-leaders-layer', 'pdm-pin-anchors-layer']) {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', territory ? 'visible' : 'none')
      }
      const axisColor = metasContent.axes.find(item => item.name === axis)?.color
      // Fora do detalhe, as mesmas regras visuais anteriores são mantidas.
      map.setPaintProperty('pdm-area-fill', 'fill-color', axis && !territory
        ? axisColor ?? '#A7ABB1' : '#A7ABB1')
      map.setPaintProperty('pdm-area-fill', 'fill-opacity', axis && !territory ? .35 : .30)
      map.setPaintProperty('pdm-region-border', 'line-color', axis && !territory
        ? axisColor ?? '#596168' : '#596168')
      map.setPaintProperty('pdm-region-border', 'line-width', territory ? 1.05 : axis ? 1.6 : 1.35)
      map.setPaintProperty('pdm-region-border', 'line-opacity', territory ? .58 : .9)
      map.setPaintProperty('pdm-region-border', 'line-blur', territory ? .35 : 0)

      // Com território selecionado: clarear os vizinhos e reforçar o contorno.
      // O contorno passa à cor do eixo apenas se houver eixo selecionado.
      for (const id of ['pdm-neighbor-veil', 'pdm-selected-border-halo', 'pdm-selected-border']) {
        map.setLayoutProperty(id, 'visibility', territory ? 'visible' : 'none')
      }
      map.setFilter('pdm-neighbor-veil', ['!=', ['get', 'pdmKey'], territory || ''])
      map.setFilter('pdm-region-selected', ['==', ['get', 'pdmKey'], territory || ''])
      map.setFilter('pdm-selected-border-halo', ['==', ['get', 'pdmKey'], territory || ''])
      map.setFilter('pdm-selected-border', ['==', ['get', 'pdmKey'], territory || ''])
      map.setPaintProperty('pdm-region-selected', 'fill-color', territory && axisColor ? axisColor : '#93C5E0')
      map.setPaintProperty('pdm-region-selected', 'fill-opacity', territory ? .12 : 0)
      map.setPaintProperty('pdm-selected-border', 'line-color', territory && axisColor ? axisColor : '#3F4853')
      renderPinsRef.current()
      applyCameraRef.current()
    }
    if (initialized.current) sync()
    else map.once('load', sync)
    return () => { map.off('load', sync) }
  }, [filteredPoints, axis, territory, features])

  return <div className="metas-map__canvas" ref={container} role="region"
    aria-label={territory ? 'Mapa da subprefeitura selecionada, com pins numerados' : 'Mapa de São Paulo em cinza com pontos das metas'} />
}
