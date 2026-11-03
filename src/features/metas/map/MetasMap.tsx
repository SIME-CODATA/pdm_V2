import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MetaSummary } from '../api/metas.schemas'
import { metasContent } from '../data/metas.content'
import { buildMetaPins, codeName, territoryName, SAO_PAULO_ALLOWED, SAO_PAULO_OVERVIEW } from './metas.geo'
import type { Bounds, TerritoryFeature } from './metas.geo'
import './MetasMap.css'

maplibregl.setWorkerUrl(workerUrl)

interface Props {
  metas: MetaSummary[]
  features: TerritoryFeature[]
  activeCode: string | null
  onBounds: (bounds: Bounds | null) => void
  onSelect: (code: string) => void
  resetKey: number
}

interface MapMarker {
  marker: maplibregl.Marker
  button: HTMLButtonElement
}

const overview = SAO_PAULO_OVERVIEW
const asMapBounds = (bounds: Bounds): [[number, number], [number, number]] => [
  [bounds.west, bounds.south], [bounds.east, bounds.north],
]

export function MetasMap({ metas, features, activeCode, onBounds, onSelect, resetKey }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markers = useRef<Map<string, MapMarker>>(new Map())
  const handlers = useRef({ onBounds, onSelect })
  const initialView = useRef<{ zoom: number; center: [number, number] } | null>(null)

  useEffect(() => { handlers.current = { onBounds, onSelect } }, [onBounds, onSelect])

  useEffect(() => {
    if (!container.current) return
    const map = new maplibregl.Map({
      container: container.current,
      style: metasContent.mapStyle,
      bounds: asMapBounds(overview),
      fitBoundsOptions: { padding: 20 },
      maxBounds: asMapBounds(SAO_PAULO_ALLOWED),
      minZoom: 8.5,
      maxZoom: 14,
      attributionControl: {},
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

    const moved = () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      if (!initialView.current) initialView.current = { zoom, center: [center.lng, center.lat] }
      const initial = initialView.current
      const inInitialView = Math.abs(initial.zoom - zoom) < 0.02 &&
        Math.abs(initial.center[0] - center.lng) < 0.001 &&
        Math.abs(initial.center[1] - center.lat) < 0.001
      const b = map.getBounds()
      const current: Bounds = {
        west: b.getWest(), east: b.getEast(),
        south: b.getSouth(), north: b.getNorth(),
        zoom, center: [center.lng, center.lat],
      }
      const entireCity = current.west <= overview.west && current.east >= overview.east &&
        current.south <= overview.south && current.north >= overview.north
      handlers.current.onBounds(inInitialView || entireCity ? null : current)
      if (container.current) container.current.dataset.zoom = zoom >= 11.6 ? 'close' : zoom >= 10.7 ? 'medium' : 'far'
    }
    map.on('moveend', moved)
    map.on('load', moved)

    // Não remover/recriar os pins durante zoom: o próprio MapLibre os mantém
    // ligados às coordenadas enquanto projeta o mapa.
    return () => {
      for (const { marker } of markers.current.values()) marker.remove()
      markers.current.clear()
      map.off('moveend', moved)
      map.off('load', moved)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (map) {
      map.fitBounds(asMapBounds(overview), { padding: 20, duration: 450 })
      handlers.current.onBounds(null)
    }
  }, [resetKey])

  // Desenha os limites oficiais, destaca a seleção e permite consultar todas
  // as metas vinculadas a um território sem empilhar dezenas de pins.
  // O mapa de fundo pode mostrar municípios vizinhos, mas os polígonos delimitam
  // exatamente onde estão os territórios paulistanos.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !features.length) return
    const popupForTerritory = (event: maplibregl.MapLayerMouseEvent) => {
      const name = event.features?.[0]?.properties?.nome
      if (typeof name !== 'string') return
      const matched = metas.filter(meta => meta.regionalizada &&
        meta.subprefeituras.some(sub => codeName(sub) === codeName(name)))
      if (!matched.length) return
      const panel = document.createElement('div')
      panel.style.cssText = 'max-width:300px;color:#272361;font-family:inherit'
      const title = document.createElement('strong')
      title.textContent = `${name} · ${matched.length} metas vinculadas`
      panel.append(title)
      const list = document.createElement('div')
      list.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;max-height:190px;overflow-y:auto;margin-top:10px'
      for (const meta of matched.sort((a, b) => Number(a.numero) - Number(b.numero))) {
        const action = document.createElement('button')
        action.type = 'button'
        action.textContent = meta.numero
        action.title = meta.titulo
        action.style.cssText = `padding:5px 9px;border-radius:7px;border:1px solid #cad5dd;background:#fff;color:${meta.eixo.cor_principal ?? '#0079AB'};font-weight:700;cursor:pointer`
        action.addEventListener('click', () => { handlers.current.onSelect(meta.codigo); popup.remove() })
        list.append(action)
      }
      panel.append(list)
      const popup = new maplibregl.Popup({ maxWidth: '340px' })
        .setLngLat(event.lngLat).setDOMContent(panel).addTo(map)
    }
    const sync = () => {
      const id = 'pdm-subprefeituras'
      const data = { type: 'FeatureCollection' as const, features } as unknown as Parameters<maplibregl.GeoJSONSource['setData']>[0]
      const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined
      if (source) source.setData(data)
      else {
        map.addSource(id, { type: 'geojson', data })
        map.addLayer({
          id: 'pdm-meta-area', type: 'fill', source: id,
          paint: { 'fill-color': '#0079AB', 'fill-opacity': 0.17 },
        })
        map.addLayer({
          id: 'pdm-subprefeitura-border', type: 'line', source: id,
          paint: { 'line-color': '#0079AB', 'line-opacity': 0.5, 'line-width': 1.1 },
        })
        map.addLayer({
          id: 'pdm-territory-hit', type: 'fill', source: id,
          paint: { 'fill-color': '#0079AB', 'fill-opacity': 0.005 },
        })
      }
      const meta = metas.find(item => item.codigo === activeCode)
      const keys = new Set(meta?.subprefeituras.map(codeName) ?? [])
      const selectedNames = features.filter(feature => keys.has(codeName(territoryName(feature))))
        .map(territoryName)
      map.setFilter('pdm-meta-area', ['in', ['get', 'nome'], ['literal', selectedNames]])
      map.on('click', 'pdm-territory-hit', popupForTerritory)
    }
    if (map.isStyleLoaded()) sync()
    else map.once('load', sync)
    return () => {
      map.off('load', sync)
      if (map.getLayer('pdm-territory-hit')) map.off('click', 'pdm-territory-hit', popupForTerritory)
    }
  }, [features, metas, activeCode])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const pins = buildMetaPins(metas, features)
    const desired = new Set(pins.map(pin => pin.id))
    for (const [id, entry] of markers.current) {
      if (!desired.has(id)) {
        entry.marker.remove()
        markers.current.delete(id)
      }
    }

    for (const pin of pins) {
      const current = markers.current.get(pin.id)
      if (current) {
        // Atualiza apenas o conteúdo, sem remover ou mover o marcador do mapa.
        current.button.classList.toggle('metas-map__pin--selected', pin.code === activeCode)
        current.button.dataset.metaCode = pin.code
        current.button.parentElement?.classList.toggle('metas-map__marker--selected', pin.code === activeCode)
        current.button.style.setProperty('--pin-color', /^#[\da-f]{6}$/i.test(pin.color) ? pin.color : '#0079AB')
        current.button.title = `Meta ${pin.number} · ${pin.name} (referência territorial, não endereço da obra)`
        current.button.setAttribute('aria-label', current.button.title)
        const label = current.button.querySelector('span')
        if (label) label.textContent = pin.number
        continue
      }

      // O MapLibre manipula o transform da DIV externa para posicionar o
      // marcador. A rotação CSS do pin fica apenas no BUTTON interno.
      const wrapper = document.createElement('div')
      wrapper.className = `metas-map__marker${pin.code === activeCode ? ' metas-map__marker--selected' : ''}`
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `metas-map__pin${pin.code === activeCode ? ' metas-map__pin--selected' : ''}`
      button.style.setProperty('--pin-color', /^#[\da-f]{6}$/i.test(pin.color) ? pin.color : '#0079AB')
      button.dataset.metaCode = pin.code
      button.title = `Meta ${pin.number} · ${pin.name} (referência territorial, não endereço da obra)`
      button.setAttribute('aria-label', button.title)
      const label = document.createElement('span')
      label.textContent = pin.number
      button.append(label)
      wrapper.append(button)
      button.addEventListener('click', event => {
        event.stopPropagation()
        const code = button.dataset.metaCode
        if (code) handlers.current.onSelect(code)
      })
      const marker = new maplibregl.Marker({ element: wrapper, anchor: 'bottom' })
        .setLngLat(pin.position)
        .addTo(map)
      markers.current.set(pin.id, { marker, button })
    }
  }, [metas, features, activeCode])

  return <div ref={container} className="metas-map__canvas" role="region" aria-label="Mapa interativo das metas por subprefeitura" />
}
