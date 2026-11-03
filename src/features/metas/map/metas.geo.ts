import type { MetaSummary } from '../api/metas.schemas'
import { normalizar } from '../lib/metas.utils'

// As coordenadas abaixo delimitam SOMENTE a área geral do município, não uma obra.
// A geometria de cada subprefeitura deve vir de GeoJSON com referências verificadas.
export type Coord = [number, number]
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
export interface Bounds {
  west: number
  south: number
  east: number
  north: number
}

// Enquadramento visual. NÃO representa a geometria administrativa oficial da cidade.
// Evita começar com o oceano no mapa; o zoom máximo continua limitado pelo MapLibre.
export const SAO_PAULO_OVERVIEW: Bounds = {
  west: -46.87, south: -23.92, east: -46.36, north: -23.38,
}
export const SAO_PAULO_ALLOWED: Bounds = {
  west: -46.95, south: -24.00, east: -46.31, north: -23.34,
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

function hasGeometry(value: unknown): value is TerritoryFeature {
  return isRecord(value) && value.type === 'Feature' &&
    isRecord(value.geometry) &&
    ['Polygon', 'MultiPolygon'].includes(String(value.geometry.type)) &&
    Array.isArray(value.geometry.coordinates) && isRecord(value.properties)
}

export function asFeatures(value: unknown): TerritoryFeature[] {
  if (isRecord(value) && value.type === 'FeatureCollection' && Array.isArray(value.features)) {
    return value.features.filter(hasGeometry)
  }
  if (isRecord(value)) {
    for (const key of ['data', 'geojson', 'subprefeituras', 'territorios', 'geometrias', 'mapa']) {
      const result = asFeatures(value[key])
      if (result.length) return result
    }
  }
  return []
}

function pointsOf(feature: TerritoryFeature): Coord[] {
  const result: Coord[] = []
  const walk = (item: unknown) => {
    if (Array.isArray(item) && item.length >= 2 &&
      typeof item[0] === 'number' && typeof item[1] === 'number') {
      result.push([item[0], item[1]])
    } else if (Array.isArray(item)) item.forEach(walk)
  }
  walk(feature.geometry.coordinates)
  return result
}

export function bbox(feature: TerritoryFeature): Bounds {
  const bounds: Bounds = { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity }
  for (const [lng, lat] of pointsOf(feature)) {
    bounds.west = Math.min(bounds.west, lng)
    bounds.east = Math.max(bounds.east, lng)
    bounds.south = Math.min(bounds.south, lat)
    bounds.north = Math.max(bounds.north, lat)
  }
  return bounds
}

export function intersects(a: Bounds, b: Bounds): boolean {
  return a.west <= b.east && a.east >= b.west &&
    a.south <= b.north && a.north >= b.south
}

// Rejeitar dados com eixos trocados, coordenadas projetadas ou geometrias fora da cidade.
// É mais seguro não mostrar um pin do que colocá-lo no mar.
export function validTerritory(feature: TerritoryFeature): boolean {
  const points = pointsOf(feature)
  if (points.length < 4 || !territoryName(feature)) return false
  const anchor = territoryAnchor(territoryName(feature))
  // Um polígono precisa corresponder ao NOME da subprefeitura: uma caixa de coordenadas
  // da cidade, sozinha, não impede arquivos com geometrias atribuídas ao nome errado.
  if (!anchor || !pointInFeature(anchor, feature)) return false
  return points.every(([lng, lat]) =>
    Number.isFinite(lng) && Number.isFinite(lat) &&
    lng >= SAO_PAULO_ALLOWED.west && lng <= SAO_PAULO_ALLOWED.east &&
    lat >= SAO_PAULO_ALLOWED.south && lat <= SAO_PAULO_ALLOWED.north
  )
}

const cleanFeatures = (value: unknown): TerritoryFeature[] =>
  asFeatures(value).filter(validTerritory)

async function load(url: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Camada territorial indisponível (${response.status})`)
  return await response.json() as unknown
}

export async function loadTerritories(mapPayload: unknown, signal?: AbortSignal): Promise<TerritoryData> {
  const fromApi = cleanFeatures(mapPayload)
  if (fromApi.length) return { type: 'FeatureCollection', features: fromApi, source: 'api' }

  try {
    const local = cleanFeatures(await load(`${import.meta.env.BASE_URL}data/subprefeituras.geojson`, signal))
    if (local.length) return { type: 'FeatureCollection', features: local, source: 'local' }
  } catch (error) { if (signal?.aborted) throw error }

  // Sem polígonos verificados, usamos só pontos territoriais aproximados.
  // NÃO carregar automaticamente geometrias comunitárias que já produziram pins no mar.
  return { type: 'FeatureCollection', features: [], source: 'reference' }
}

export function territoryName(feature: TerritoryFeature): string {
  const properties = feature.properties
  for (const key of ['name', 'nome', 'nm_subpref', 'nm_subprefeitura', 'ds_nome', 'subprefeitura', 'NOME', 'NAME']) {
    if (typeof properties[key] === 'string') return properties[key] as string
  }
  return ''
}

const aliases: Record<string, string> = {
  perusanhanguera: 'perus',
  casaverdecachoeirinha: 'casaverde',
  saomiguelpaulista: 'saomiguel',
  freguesiabrasilandia: 'freguesiadoobrasilandia',
  freguesiadoobrasilandia: 'freguesiadoobrasilandia',
  freguesiado: 'freguesiadoobrasilandia',
  aricanduvaformosacarrao: 'aricanduva',
  vilamariavilaguilherme: 'vilamaria',
  mboimirim: 'mboimirim',
  jacanatremembe: 'jacana',
  piritubajaragua: 'pirituba',
  perus: 'perus',
  itaimpaulista: 'itaimpaulista',
  santanatucuruvi: 'santanatucuruvi',
  capeladosocorro: 'capeladosocorro',
  se: 'se',
}
export function codeName(value: string): string {
  const name = normalizar(value)
  return aliases[name] || name
}
export function matchesTerritory(a: string, b: string): boolean {
  return codeName(a) === codeName(b)
}
export function featureForName(features: TerritoryFeature[], name: string): TerritoryFeature | undefined {
  return features.find(feature => matchesTerritory(territoryName(feature), name))
}
// Pontos de referência VISUAIS, aproximados, no núcleo urbano de cada subprefeitura.
// NÃO são coordenadas das obras nem limites oficiais. Substituir/complementar por GeoSampa.
// As posições foram escolhidas para impedir os deslocamentos errados da base provisória.
export const TERRITORY_ANCHORS: Readonly<Record<string, Coord>> = {
  aricanduva: [-46.510, -23.571],
  butanta: [-46.717, -23.573],
  campolimpo: [-46.768, -23.646],
  capeladosocorro: [-46.710, -23.710],
  casaverde: [-46.656, -23.510],
  cidadeademar: [-46.661, -23.675],
  cidadetiradentes: [-46.407, -23.584],
  ermelinomatarazzo: [-46.480, -23.485],
  freguesiadoobrasilandia: [-46.700, -23.506],
  guaianases: [-46.413, -23.545],
  ipiranga: [-46.601, -23.592],
  itaimpaulista: [-46.404, -23.495],
  itaquera: [-46.454, -23.538],
  jabaquara: [-46.644, -23.653],
  jacana: [-46.587, -23.459],
  lapa: [-46.704, -23.522],
  mboimirim: [-46.761, -23.686],
  mooca: [-46.591, -23.565],
  parelheiros: [-46.717, -23.825],
  penha: [-46.531, -23.526],
  perus: [-46.757, -23.409],
  pinheiros: [-46.694, -23.568],
  pirituba: [-46.738, -23.483],
  santanatucuruvi: [-46.624, -23.492],
  santoamaro: [-46.696, -23.649],
  saomateus: [-46.477, -23.604],
  saomiguel: [-46.445, -23.495],
  sapopemba: [-46.512, -23.606],
  se: [-46.633, -23.551],
  vilamaria: [-46.592, -23.504],
  vilamariana: [-46.637, -23.588],
  vilaprudente: [-46.577, -23.589],
}
export function territoryAnchor(name: string): Coord | null {
  return TERRITORY_ANCHORS[codeName(name)] ?? null
}

function polygons(feature: TerritoryFeature): number[][][][] {
  return feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates as number[][][]]
    : feature.geometry.coordinates as number[][][][]
}
function pointInRing(point: Coord, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]
    if (((a[1] > point[1]) !== (b[1] > point[1])) &&
      point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}
function pointInPolygon(point: Coord, rings: number[][][]): boolean {
  return !!rings.length && pointInRing(point, rings[0]) &&
    !rings.slice(1).some(ring => pointInRing(point, ring))
}
export function pointInFeature(point: Coord, feature: TerritoryFeature): boolean {
  return polygons(feature).some(rings => pointInPolygon(point, rings))
}

function segmentCrossesBox(p: number[], q: number[], bounds: Bounds): boolean {
  const dx = q[0] - p[0], dy = q[1] - p[1]
  const clip = (slope: number, offset: number, range: [number, number]): boolean => {
    if (!slope) return offset >= 0
    const t = offset / slope
    if (slope < 0) {
      if (t > range[1]) return false
      if (t > range[0]) range[0] = t
    } else {
      if (t < range[0]) return false
      if (t < range[1]) range[1] = t
    }
    return true
  }
  const range: [number, number] = [0, 1]
  return clip(-dx, p[0] - bounds.west, range) &&
    clip(dx, bounds.east - p[0], range) &&
    clip(-dy, p[1] - bounds.south, range) &&
    clip(dy, bounds.north - p[1], range)
}

export function intersectsViewport(feature: TerritoryFeature, bounds: Bounds): boolean {
  if (!intersects(bbox(feature), bounds)) return false
  const corners: Coord[] = [
    [bounds.west, bounds.south], [bounds.west, bounds.north],
    [bounds.east, bounds.south], [bounds.east, bounds.north],
  ]
  if (corners.some(point => pointInFeature(point, feature))) return true
  for (const polygon of polygons(feature)) for (const ring of polygon) {
    for (let i = 0; i < ring.length; i++) {
      const p = ring[i], q = ring[(i + 1) % ring.length]
      if (p[0] >= bounds.west && p[0] <= bounds.east &&
        p[1] >= bounds.south && p[1] <= bounds.north) return true
      if (segmentCrossesBox(p, q, bounds)) return true
    }
  }
  return false
}

export function areaMatches(meta: MetaSummary, territories: TerritoryFeature[], visible: Bounds | null): boolean {
  if (!visible) return true
  if (!meta.regionalizada || !meta.subprefeituras.length) return false
  return meta.subprefeituras.some(name => {
    const feature = featureForName(territories, name)
    if (feature && validTerritory(feature)) return intersectsViewport(feature, visible)
    // Enquanto o GeoJSON oficial não for instalado, o filtro por zoom usa a
    // vizinhança do ponto territorial. É aproximado, não equivale ao limite legal.
    const anchor = territoryAnchor(name)
    if (!anchor) return false
    const [lng, lat] = anchor
    const marginLng = 0.022, marginLat = 0.018
    return intersects(visible, {
      west: lng - marginLng, east: lng + marginLng,
      south: lat - marginLat, north: lat + marginLat,
    })
  })
}

// Um ponto DENTRO do polígono, e nunca em um endereço presumido.
export function representativePosition(feature: TerritoryFeature): Coord | null {
  if (!validTerritory(feature)) return null
  const bounds = bbox(feature)
  const middle: Coord = [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2]
  if (pointInFeature(middle, feature)) return middle
  for (let resolution = 6; resolution <= 24; resolution += 6) {
    for (let y = 1; y < resolution; y++) for (let x = 1; x < resolution; x++) {
      const candidate: Coord = [
        bounds.west + (x / resolution) * (bounds.east - bounds.west),
        bounds.south + (y / resolution) * (bounds.north - bounds.south),
      ]
      if (pointInFeature(candidate, feature)) return candidate
    }
  }
  return null
}

// Pequeno deslocamento determinístico para não sobrepor completamente as metas.
// Máximo ~250 m do ponto territorial, em vez de distribuir pins pelo polígono todo.
function offsetAround(anchor: Coord, index: number, total: number, feature?: TerritoryFeature): Coord {
  if (total < 2) return anchor
  const angle = index * 2.399963229728653
  const radius = Math.min(0.0022, 0.0007 * Math.sqrt(index + 1))
  const candidate: Coord = [
    anchor[0] + Math.cos(angle) * radius / Math.cos(anchor[1] * Math.PI / 180),
    anchor[1] + Math.sin(angle) * radius,
  ]
  // Se temos o polígono validado, o deslocamento também precisa permanecer nele.
  return feature && !pointInFeature(candidate, feature) ? anchor : candidate
}

export interface MetaPin {
  id: string
  code: string
  number: string
  name: string
  position: Coord
  color: string
}
export function buildMetaPins(metas: MetaSummary[], features: TerritoryFeature[], zoom: number): MetaPin[] {
  const groups = new Map<string, MetaSummary[]>()
  for (const meta of metas) {
    if (!meta.regionalizada) continue
    const names = [...new Map(meta.subprefeituras
      .filter(name => !!territoryAnchor(name))
      .map(name => [codeName(name), name])).values()]
    if (!names.length) continue
    // Visão geral: apenas um pin por meta. O território é escolhido de modo
    // estável a partir do número para distribuir metas entre suas áreas reais.
    const code = Number.parseInt(meta.numero, 10) || 0
    const selected = zoom >= 10.3 ? names : [names[code % names.length]]
    for (const name of selected) {
      const key = codeName(name)
      const group = groups.get(key) ?? []
      if (!group.some(item => item.codigo === meta.codigo)) group.push(meta)
      groups.set(key, group)
    }
  }
  const pins: MetaPin[] = []
  for (const [key, group] of groups) {
    const anchor = TERRITORY_ANCHORS[key]
    if (!anchor) continue
    const name = group[0].subprefeituras.find(entry => codeName(entry) === key) ?? key
    const feature = featureForName(features, name)
    const verified = feature && validTerritory(feature) ? feature : undefined
    group.sort((a, b) => a.codigo.localeCompare(b.codigo))
    group.forEach((meta, index) => {
      pins.push({
        id: `${meta.codigo}-${key}`,
        code: meta.codigo,
        number: meta.numero,
        name,
        position: offsetAround(anchor, index, group.length, verified),
        color: meta.eixo.cor_principal ?? '#0079AB',
      })
    })
  }
  return pins
}
