/** Geometrias públicas do CMS. Não gera posições artificiais de metas. */
import type { MetaSummary } from '../api/metas.schemas'
import { normalizar } from '../lib/metas.utils'

export type Position = [number, number] // [longitude, latitude], EPSG:4326
export type MapPolygon = { type: 'Polygon'; coordinates: number[][][] } |
  { type: 'MultiPolygon'; coordinates: number[][][][] }
export type MapPoint = { type: 'Point'; coordinates: number[] } |
  { type: 'MultiPoint'; coordinates: number[][] }
export interface TerritoryFeature {
  type: 'Feature'
  geometry: MapPolygon
  properties: Record<string, unknown>
}
export interface TerritoryCollection { type: 'FeatureCollection'; features: TerritoryFeature[] }
export interface PublishedPoint {
  id: string
  code: string
  number: string
  actionCode: string
  position: Position
  color: string
  axis: string
}
export interface GeographicBounds { west: number; south: number; east: number; north: number }

// Nunca entregar Infinity, NaN ou limites degenerados ao fitBounds do MapLibre.
export function validBounds(bounds: GeographicBounds | null | undefined): bounds is GeographicBounds {
  return !!bounds &&
    [bounds.west, bounds.south, bounds.east, bounds.north].every(Number.isFinite) &&
    bounds.west >= -180 && bounds.east <= 180 &&
    bounds.south >= -90 && bounds.north <= 90 &&
    bounds.west < bounds.east && bounds.south < bounds.north
}

const obj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v)
const str = (v: unknown) => typeof v === 'string' || typeof v === 'number' ? String(v).trim() : ''

const territoryAliases: Record<string, string> = {
  perusanhanguera: 'perus', casaverdecachoeirinha: 'casaverde',
  casaverdelimaocachoeirinha: 'casaverde', saomiguelpaulista: 'saomiguel',
  freguesiadoobrasilandia: 'freguesiabrasilandia',
  aricanduvaformosacarrao: 'aricanduva', vilamariavilaguilherme: 'vilamaria',
  jacanatremembe: 'jacana', piritubajaragua: 'pirituba',
  santanatucuruvi: 'santana',
}
export function territoryKey(name: string) {
  const key = normalizar(name)
  return territoryAliases[key] ?? key
}
export function territoryName(feature: TerritoryFeature): string {
  for (const key of ['nome', 'name', 'nm_subpref', 'nm_subprefeitura', 'nome_subprefeitura', 'ds_subpref', 'ds_nome', 'subprefeitura', 'Subprefeitura', 'NOME', 'NAME']) {
    const value = str(feature.properties[key]); if (value) return value
  }
  return ''
}
const validCoordinate = (position: number[]): position is Position =>
  position.length >= 2 && Number.isFinite(position[0]) && Number.isFinite(position[1]) &&
  position[0] >= -46.95 && position[0] <= -46.25 &&
  position[1] >= -24.15 && position[1] <= -23.25

function polygonFeatures(raw: unknown, depth = 0): TerritoryFeature[] {
  if (depth > 5 || !obj(raw)) return []
  if (raw.type === 'FeatureCollection' && Array.isArray(raw.features)) {
    return raw.features.flatMap((f): TerritoryFeature[] => {
      if (!obj(f) || f.type !== 'Feature' || !obj(f.geometry) ||
        !['Polygon', 'MultiPolygon'].includes(String(f.geometry.type)) ||
        !Array.isArray(f.geometry.coordinates)) return []
      return [{ type: 'Feature', geometry: f.geometry as unknown as MapPolygon,
        properties: obj(f.properties) ? f.properties : {} }]
    })
  }
  if (raw.type === 'Feature' && obj(raw.geometry) &&
    (raw.geometry.type === 'Polygon' || raw.geometry.type === 'MultiPolygon')) {
    return [{ type: 'Feature', geometry: raw.geometry as unknown as MapPolygon,
      properties: obj(raw.properties) ? raw.properties : {} }]
  }
  for (const key of ['data', 'geojson', 'camada', 'camadas', 'subprefeituras', 'territorios', 'geometrias', 'mapa', 'mascara', 'mask']) {
    const result = polygonFeatures(raw[key], depth + 1)
    if (result.length) return result
  }
  return []
}
function polygonRings(g: MapPolygon): number[][][][] {
  return g.type === 'Polygon' ? [g.coordinates] : g.coordinates
}
export function getTerritories(raw: unknown): TerritoryCollection {
  const found = polygonFeatures(raw)
  const unique = new Map<string, TerritoryFeature>()
  for (const feature of found) {
    const key = territoryKey(territoryName(feature))
    const polygons = polygonRings(feature.geometry)
    // Array.every() em uma lista vazia retorna true. Por isso exigimos anéis reais.
    const hasValidRings = polygons.length > 0 && polygons.every(polygon =>
      polygon.length > 0 && polygon.every(ring =>
        Array.isArray(ring) && ring.length >= 4 &&
        ring.every(position => Array.isArray(position) && validCoordinate(position))))
    if (!key || !hasValidRings || !validBounds(featureBounds(feature))) continue
    unique.set(key, { ...feature, properties: { ...feature.properties, nome: territoryName(feature), pdmKey: key } })
  }
  return { type: 'FeatureCollection', features: [...unique.values()] }
}
export function asPolygonCollection(raw: unknown): TerritoryCollection {
  return { type: 'FeatureCollection', features: polygonFeatures(raw) }
}
export function featureBounds(feature: TerritoryFeature): GeographicBounds {
  const box = { west: Infinity, south: Infinity, east: -Infinity, north: -Infinity }
  for (const polygon of polygonRings(feature.geometry)) {
    for (const ring of polygon) for (const point of ring) {
      if (point.length < 2) continue
      const [lng, lat] = point
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue
      box.west = Math.min(box.west, lng)
      box.east = Math.max(box.east, lng)
      box.south = Math.min(box.south, lat)
      box.north = Math.max(box.north, lat)
    }
  }
  return box
}
export function allBounds(features: TerritoryFeature[]): GeographicBounds | null {
  const boxes = features.map(featureBounds).filter(validBounds)
  if (!boxes.length) return null
  const merged = {
    west: Math.min(...boxes.map(b => b.west)), south: Math.min(...boxes.map(b => b.south)),
    east: Math.max(...boxes.map(b => b.east)), north: Math.max(...boxes.map(b => b.north)),
  }
  return validBounds(merged) ? merged : null
}
function pointInsideRing([lng, lat]: Position, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j]
    if ((a[1] > lat) !== (b[1] > lat) &&
      lng < (b[0] - a[0]) * (lat - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
  }
  return inside
}
export function inTerritory(point: Position, feature: TerritoryFeature): boolean {
  return polygonRings(feature.geometry).some(rings =>
    !!rings[0] && pointInsideRing(point, rings[0]) &&
    !rings.slice(1).some(hole => pointInsideRing(point, hole)))
}
export function territoryForPoint(point: Position, features: TerritoryFeature[]): string {
  const found = features.find(f => inTerritory(point, f))
  return found ? territoryKey(territoryName(found)) : ''
}

function metaCode(raw: unknown): string {
  const text = str(raw)
  // Pode chegar como '01', 1, '01.00.02' ou 'meta_01'.
  const match = text.match(/^(?:meta[_ -]?)?(\d{1,3})(?:[.]\d+)*$/i)
  return match ? String(Number(match[1])).padStart(2, '0') : ''
}
function published(props: Record<string, unknown>): boolean {
  // A API pública já deve filtrar dados não autorizados. Esta é defesa adicional.
  for (const name of ['publicavel', 'publicado', 'publica', 'fonte_publicada', 'localizacao_publicavel',
    'localizacao_autorizada', 'pode_publicar']) {
    if (!(name in props)) continue
    const value = props[name]
    if (value === false || value === 0 || ['nao', 'não', 'false', '0'].includes(str(value).toLowerCase())) return false
  }
  return true
}
export function getPublishedPoints(raw: unknown, metas: MetaSummary[]): PublishedPoint[] {
  const byCode = new Map(metas.map(m => [metaCode(m.codigo), m]))
  const found = new Map<string, PublishedPoint>()
  // Busca SOMENTE coleções GeoJSON retornadas por endpoints públicos;
  // nunca vasculha abas_excel / fontes operacionais privadas.
  function visit(value: unknown, inheritedCode = '', level = 0): void {
    if (level > 6 || !obj(value) || !published(value)) return
    const context = metaCode(value.codigo_meta ?? value.meta_codigo ?? value.metaCode ?? value.codigo) || inheritedCode
    if (value.type === 'FeatureCollection' && Array.isArray(value.features)) {
      for (const f of value.features) {
        if (!obj(f) || f.type !== 'Feature' || !obj(f.geometry)) continue
        const p = obj(f.properties) ? f.properties : {}
        if (!published(p)) continue
        const code = metaCode(p.codigo_meta ?? p.meta_codigo ?? p.meta ?? p.numero_meta ?? p.meta_number ?? p.codigo ?? p.geocodigo) || context
        const meta = byCode.get(code)
        if (!meta || !meta.regionalizada) continue
        const g = f.geometry as unknown as MapPoint
        if (g.type !== 'Point' && g.type !== 'MultiPoint') continue
        const positions: number[][] = g.type === 'Point' ? [g.coordinates] : g.coordinates
        for (const pos of positions) {
          if (!Array.isArray(pos) || !validCoordinate(pos)) continue
          const actionCode = str(p.geocodigo ?? p.codigo_acao ?? p.action_code ?? p.codigo ?? f.id)
          const id = [code, actionCode || 'local', pos[0].toFixed(6), pos[1].toFixed(6)].join(':')
          found.set(id, { id, code: meta.codigo, number: meta.numero, actionCode, position: [pos[0], pos[1]],
            color: meta.eixo.cor_principal || '#0079AB', axis: meta.eixo.nome })
        }
      }
      return
    }
    if (Array.isArray(value.features)) visit({ type: 'FeatureCollection', features: value.features }, context, level + 1)
    for (const key of ['mapa', 'geojson', 'data', 'pontos', 'metas', 'items', 'localizacoes', 'resultados']) {
      const nested = value[key]
      if (Array.isArray(nested)) for (const item of nested) visit(item, context, level + 1)
      else if (nested) visit(nested, context, level + 1)
    }
  }
  visit(raw)
  return [...found.values()]
}
