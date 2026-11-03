import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { MetaSummary } from '../api/metas.schemas'
import { metasContent } from '../data/metas.content'
import { buildMetaPins, SAO_PAULO_ALLOWED, SAO_PAULO_OVERVIEW } from './metas.geo'
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

const overview = SAO_PAULO_OVERVIEW
const asMapBounds = (bounds: Bounds): [[number, number], [number, number]] => [
  [bounds.west, bounds.south], [bounds.east, bounds.north],
]

export function MetasMap({ metas, features, activeCode, onBounds, onSelect, resetKey }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])
  const handlers = useRef({ onBounds, onSelect })
  const [zoom, setZoom] = useState(9)

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
      maxZoom: 12.8,
      attributionControl: {},
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

    const moved = () => {
      const bounds = map.getBounds()
      setZoom(map.getZoom())
      const current: Bounds = {
        west: bounds.getWest(), east: bounds.getEast(),
        south: bounds.getSouth(), north: bounds.getNorth(),
      }
      const entireCity = current.west <= overview.west && current.east >= overview.east &&
        current.south <= overview.south && current.north >= overview.north
      handlers.current.onBounds(entireCity ? null : current)
    }
    map.on('moveend', moved)
    map.on('load', moved)
    return () => {
      markers.current.forEach(marker => marker.remove())
      markers.current = []
      map.off('moveend', moved)
      map.off('load', moved)
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.fitBounds(asMapBounds(overview), { padding: 20, duration: 450 })
  }, [resetKey])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    for (const pin of buildMetaPins(metas, features, zoom)) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `metas-map__pin${pin.code === activeCode ? ' metas-map__pin--selected' : ''}`
      button.style.setProperty('--pin-color', /^#[\da-f]{6}$/i.test(pin.color) ? pin.color : '#0079AB')
      button.dataset.metaCode = pin.code
      button.title = `Meta ${pin.number} · ${pin.name} (ponto de referência da subprefeitura, não local da obra)`
      button.setAttribute('aria-label', button.title)
      const label = document.createElement('span')
      label.textContent = pin.number
      button.append(label)
      button.addEventListener('click', event => {
        event.stopPropagation()
        handlers.current.onSelect(pin.code)
      })
      markers.current.push(new maplibregl.Marker({ element: button, anchor: 'bottom' })
        .setLngLat(pin.position).addTo(map))
    }
  }, [metas, features, zoom, activeCode])

  return <div ref={container} className="metas-map__canvas" role="region" aria-label="Mapa interativo das metas por subprefeitura" />
}
