import type { MetaSummary } from '../api/metas.schemas'
import { normalizar } from '../lib/metas.utils'

export type Coord = [number, number]
export interface Bounds {
  west: number; south: number; east: number; north: number
  zoom?: number
  center?: Coord
}
export interface MapGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][][] | number[][][][]
}
export interface TerritoryFeature {
  type: 'Feature'
  geometry: MapGeometry
  properties: Record<string, unknown>
}
export interface TerritoryData {
  type: 'FeatureCollection'
  features: TerritoryFeature[]
  source: 'api' | 'local' | 'reference'
}

// Enquadramento geográfico amplo: não equivale a um polígono administrativo.
export const SAO_PAULO_OVERVIEW: Bounds = { west: -46.84, south: -24.03, east: -46.35, north: -23.34 }
export const SAO_PAULO_ALLOWED: Bounds = { west: -46.91, south: -24.09, east: -46.29, north: -23.30 }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

function hasGeometry(value: unknown): value is TerritoryFeature {
  return isRecord(value) && value.type === 'Feature' && isRecord(value.geometry) &&
    (value.geometry.type === 'Polygon' || value.geometry.type === 'MultiPolygon') &&
    Array.isArray(value.geometry.coordinates) && isRecord(value.properties)
}

export function asFeatures(value: unknown): TerritoryFeature[] {
  if (isRecord(value) && value.type === 'FeatureCollection' && Array.isArray(value.features)) {
    return value.features.filter(hasGeometry)
  }
  if (isRecord(value)) for (const key of ['data', 'geojson', 'subprefeituras', 'territorios', 'geometrias', 'mapa']) {
    const result = asFeatures(value[key])
    if (result.length) return result
  }
  return []
}

export function territoryName(feature: TerritoryFeature): string {
  for (const key of ['nome', 'name', 'nm_subpref', 'nm_subprefeitura', 'ds_nome', 'subprefeitura', 'NOME', 'NAME']) {
    const value = feature.properties[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return ''
}

// Chaves canônicas compartilhadas entre o GeoJSON da Prefeitura e a API SMAE.
const aliases: Record<string, string> = {
  perusanhanguera: 'perus',
  casaverdecachoeirinha: 'casaverde',
  casaverdelimaocachoeirinha: 'casaverde',
  saomiguelpaulista: 'saomiguel',
  freguesiabrasilandia: 'freguesiabrasilandia',
  freguesiadoobrasilandia: 'freguesiabrasilandia',
  aricanduvaformosacarrao: 'aricanduva',
  vilamariavilaguilherme: 'vilamaria',
  jacanatremembe: 'jacana',
  piritubajaragua: 'pirituba',
  santanatucuruvi: 'santana',
  capeladosocorro: 'capeladosocorro',
  mboimirim: 'mboimirim',
}
export function codeName(name: string): string {
  const key = normalizar(name)
  return aliases[key] ?? key
}
export function matchesTerritory(a: string, b: string): boolean { return codeName(a) === codeName(b) }
export function featureForName(features: TerritoryFeature[], name: string): TerritoryFeature | undefined {
  return features.find(feature => matchesTerritory(territoryName(feature), name))
}

function polygons(feature: TerritoryFeature): number[][][][] {
  return feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates as number[][][]]
    : feature.geometry.coordinates as number[][][][]
}
function allPoints(feature: TerritoryFeature): Coord[] {
  return polygons(feature).flatMap(polygon => polygon.flatMap(ring => ring as Coord[]))
}
const boxes = new WeakMap<TerritoryFeature, Bounds>()
export function bbox(feature: TerritoryFeature): Bounds {
  const cached = boxes.get(feature)
  if (cached) return cached
  const box: Bounds = { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity }
  for (const [lng, lat] of allPoints(feature)) {
    box.west = Math.min(box.west, lng)
    box.east = Math.max(box.east, lng)
    box.south = Math.min(box.south, lat)
    box.north = Math.max(box.north, lat)
  }
  boxes.set(feature, box)
  return box
}
export function intersects(a: Bounds, b: Bounds): boolean {
  return a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south
}
export function validTerritory(feature: TerritoryFeature): boolean {
  if (!territoryName(feature)) return false
  const points = allPoints(feature)
  if (points.length < 4) return false
  // Rejeita coordenadas UTM (EPSG:31983) colocadas por engano no MapLibre.
  return points.every(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat) &&
    lng >= SAO_PAULO_ALLOWED.west && lng <= SAO_PAULO_ALLOWED.east &&
    lat >= SAO_PAULO_ALLOWED.south && lat <= SAO_PAULO_ALLOWED.north)
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`GeoJSON de subprefeituras não encontrado: ${url} (HTTP ${response.status})`)
  return await response.json() as unknown
}

export async function loadTerritories(_mapPayload: unknown, signal?: AbortSignal): Promise<TerritoryData> {
  // Fonte única, com os 32 polígonos oficiais previamente convertidos para EPSG:4326.
  const raw = await getJson(`${import.meta.env.BASE_URL}data/subprefeituras.geojson`, signal)
  const features = asFeatures(raw)
  if (features.length !== 32 || features.some(feature => !validTerritory(feature))) {
    throw new Error('GeoJSON inválido: são necessárias 32 subprefeituras com coordenadas EPSG:4326. Não use o arquivo UTM original.')
  }
  const unique = new Set(features.map(feature => codeName(territoryName(feature))))
  if (unique.size !== 32) throw new Error('GeoJSON contém subprefeituras repetidas ou nomes não identificados.')
  return { type: 'FeatureCollection', features, source: 'local' }
}

function pointInRing([lng, lat]: Coord, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]
    if ((a[1] > lat) !== (b[1] > lat) &&
      lng < (b[0] - a[0]) * (lat - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}
function inPolygon(point: Coord, rings: number[][][]): boolean {
  return !!rings[0]?.length && pointInRing(point, rings[0]) && !rings.slice(1).some(ring => pointInRing(point, ring))
}
export function pointInFeature(point: Coord, feature: TerritoryFeature): boolean {
  return polygons(feature).some(rings => inPolygon(point, rings))
}

function segmentTouchesBounds(a: number[], b: number[], box: Bounds): boolean {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  const p = [-dx, dx, -dy, dy]
  const q = [a[0] - box.west, box.east - a[0], a[1] - box.south, box.north - a[1]]
  let t0 = 0, t1 = 1
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; continue }
    const r = q[i] / p[i]
    if (p[i] < 0) t0 = Math.max(t0, r)
    else t1 = Math.min(t1, r)
    if (t0 > t1) return false
  }
  return true
}
export function intersectsViewport(feature: TerritoryFeature, viewport: Bounds): boolean {
  if (!intersects(bbox(feature), viewport)) return false
  const corners: Coord[] = [
    [viewport.west, viewport.south], [viewport.west, viewport.north],
    [viewport.east, viewport.south], [viewport.east, viewport.north],
  ]
  if (corners.some(corner => pointInFeature(corner, feature))) return true
  for (const polygon of polygons(feature)) for (const ring of polygon) {
    for (let i = 0; i < ring.length - 1; i++) {
      const p = ring[i], q = ring[i + 1]
      if ((p[0] >= viewport.west && p[0] <= viewport.east && p[1] >= viewport.south && p[1] <= viewport.north) ||
        segmentTouchesBounds(p, q, viewport)) return true
    }
  }
  return false
}

/** Subprefeitura central no zoom próximo; interseção territorial nos demais. */
export function visibleTerritoryKeys(features: TerritoryFeature[], view: Bounds | null): Set<string> | null {
  if (!view) return null
  if ((view.zoom ?? 0) >= 11.15) {
    const center: Coord = view.center ?? [(view.west + view.east) / 2, (view.south + view.north) / 2]
    const central = features.find(feature => pointInFeature(center, feature))
    if (central) return new Set([codeName(territoryName(central))])
  }
  return new Set(features.filter(feature => intersectsViewport(feature, view))
    .map(feature => codeName(territoryName(feature))))
}

export function areaMatches(meta: MetaSummary, territories: TerritoryFeature[], visible: Bounds | null): boolean {
  if (!visible) return true
  if (!meta.regionalizada) return false
  return meta.subprefeituras.some(name => {
    const feature = featureForName(territories, name)
    return !!feature && intersectsViewport(feature, visible)
  })
}

// Âncora territorial fixa. Para territórios muito extensos ao sul, privilegia
// a faixa norte do polígono (área próxima à malha urbana). Não é endereço de obra.
const representativeCache = new WeakMap<TerritoryFeature, Coord | null>()
export function representativePosition(feature: TerritoryFeature): Coord | null {
  if (representativeCache.has(feature)) return representativeCache.get(feature) ?? null
  if (!validTerritory(feature)) return null
  const box = bbox(feature)
  const height = box.north - box.south
  const target: Coord = [
    (box.west + box.east) / 2,
    height > 0.14 && box.south < -23.70
      ? box.north - height * 0.24
      : (box.south + box.north) / 2,
  ]
  let best: Coord | null = pointInFeature(target, feature) ? target : null
  if (!best) {
    let bestDistance = Infinity
    for (const n of [16, 32, 64]) {
      for (let j = 1; j < n; j++) for (let i = 1; i < n; i++) {
        const point: Coord = [
          box.west + (i / n) * (box.east - box.west),
          box.south + (j / n) * height,
        ]
        if (!pointInFeature(point, feature)) continue
        const distance = (point[0] - target[0]) ** 2 + (point[1] - target[1]) ** 2
        if (distance < bestDistance) { best = point; bestDistance = distance }
      }
      if (best) break
    }
  }
  representativeCache.set(feature, best)
  return best
}

export interface MetaPin {
  id: string // subprefeitura + codigo, um pin por associação territorial
  code: string
  number: string
  name: string
  position: Coord
  color: string
}

/**
 * Distribuição cartográfica estável, SEM coordenadas de obras: cada número é
 * uma referência de meta na subprefeitura. Pontos nunca dependem de zoom,
 * filtros ou seleção, e sempre ficam dentro do polígono oficial.
 */
const positionCache = new WeakMap<TerritoryFeature, Map<number, Coord[]>>()
export function positionsInTerritory(feature: TerritoryFeature, count: number): Coord[] {
  if (count <= 0) return []
  let cachedByCount = positionCache.get(feature)
  if (!cachedByCount) { cachedByCount = new Map(); positionCache.set(feature, cachedByCount) }
  const cached = cachedByCount.get(count)
  if (cached) return cached

  const anchor = representativePosition(feature)
  if (!anchor) return []
  const bounds = bbox(feature)
  const narrowSide = Math.min(bounds.east - bounds.west, bounds.north - bounds.south)
  // Até ~2 km de deslocamento do ponto de referência; áreas pequenas usam
  // deslocamento menor. A geometria real é validada para CADA marcador.
  const step = Math.min(0.0024, (narrowSide * 0.28) / Math.max(2, Math.sqrt(count)))
  const result: Coord[] = [anchor]
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const maxAttempts = Math.max(count * 120, 250)
  for (let i = 1; result.length < count && i < maxAttempts; i++) {
    const radius = step * Math.sqrt(i)
    const angle = goldenAngle * i
    const candidate: Coord = [
      anchor[0] + Math.cos(angle) * radius,
      anchor[1] + Math.sin(angle) * radius,
    ]
    if (pointInFeature(candidate, feature)) result.push(candidate)
  }
  // Se o ponto de referência estiver num segmento minúsculo do polígono,
  // preservamos todos os números, mesmo que compartilhem a mesma âncora.
  while (result.length < count) result.push(anchor)
  cachedByCount.set(count, result)
  return result
}

/** Todos os números, inclusive meta repetida em subprefeituras diferentes. */
export function buildMetaPins(metas: MetaSummary[], features: TerritoryFeature[]): MetaPin[] {
  const byTerritory = new Map<string, MetaSummary[]>()
  for (const meta of metas) {
    if (!meta.regionalizada) continue
    for (const key of new Set(meta.subprefeituras.map(codeName))) {
      const list = byTerritory.get(key) ?? []
      if (!list.some(item => item.codigo === meta.codigo)) list.push(meta)
      byTerritory.set(key, list)
    }
  }

  const pins: MetaPin[] = []
  for (const feature of features) {
    const name = territoryName(feature)
    const options = byTerritory.get(codeName(name))
    if (!options?.length) continue
    options.sort((a, b) => Number(a.numero) - Number(b.numero))
    const positions = positionsInTerritory(feature, options.length)
    for (let i = 0; i < options.length; i++) {
      const meta = options[i]
      const position = positions[i]
      if (!position) continue
      pins.push({
        id: `${codeName(name)}:${meta.codigo}`,
        code: meta.codigo,
        number: meta.numero,
        name,
        position,
        color: meta.eixo.cor_principal ?? '#0079AB',
      })
    }
  }
  return pins
}
