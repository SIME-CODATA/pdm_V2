//  * Espalhamento visual dos pins que se sobrepõem (colmeia hexagonal).
//  * NÃO altera a coordenada publicada: a origem continua armazenada no GeoJSON,
//  * e uma linha discreta liga o pin deslocado à sua posição verdadeira.

export interface MapPinFeature {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    code: string
    number: string
    color: string
    axis: string
    key: string
    id: string
  }
}

export interface MapLineFeature {
  type: 'Feature'
  geometry: { type: 'LineString'; coordinates: [[number, number], [number, number]] }
  properties: { id: string }
}

interface Pixel { x: number; y: number }

// Diâmetro do pin no modo região: 24px + borda e respiro.
const PIN_DISTANCE = 25
const SQRT_3 = Math.sqrt(3)

function honeycombOffsets(radius: number): Pixel[] {
  const offsets: Pixel[] = [{ x: 0, y: 0 }]
  // Coordenadas axiais da malha hexagonal; cada novo anel contém 6*r pontos.
  for (let ring = 1; ring <= 20; ring++) {
    const candidates: Pixel[] = []
    for (let q = -ring; q <= ring; q++) {
      for (let r = -ring; r <= ring; r++) {
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) !== ring) continue
        candidates.push({ x: radius * (q + r / 2), y: radius * SQRT_3 * r / 2 })
      }
    }
    candidates.sort((a, b) => Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x))
    offsets.push(...candidates)
  }
  return offsets
}

const OFFSETS = honeycombOffsets(PIN_DISTANCE)

export function spreadOverlappingPins(
  points: MapPinFeature[],
  project: (coords: [number, number]) => Pixel,
  unproject: (coords: [number, number]) => { lng: number; lat: number },
): { pins: MapPinFeature[]; leaders: MapLineFeature[]; anchors: MapPinFeature[] } {
  // Grade espacial: checar apenas vizinhos evita comparações quadráticas em regiões densas.
  const occupied = new Map<string, Pixel[]>()
  const cellSize = PIN_DISTANCE
  const cell = (value: number) => Math.floor(value / cellSize)
  const key = (x: number, y: number) => `${x}:${y}`
  const isFree = (point: Pixel): boolean => {
    const cx = cell(point.x), cy = cell(point.y)
    for (let x = cx - 1; x <= cx + 1; x++) {
      for (let y = cy - 1; y <= cy + 1; y++) {
        for (const other of occupied.get(key(x, y)) ?? []) {
          if ((point.x - other.x) ** 2 + (point.y - other.y) ** 2 < minimumSquared) return false
        }
      }
    }
    return true
  }
  const register = (point: Pixel) => {
    const id = key(cell(point.x), cell(point.y))
    const bucket = occupied.get(id) ?? []
    bucket.push(point)
    occupied.set(id, bucket)
  }
  const pins: MapPinFeature[] = []
  const leaders: MapLineFeature[] = []
  const anchors: MapPinFeature[] = []
  const minimumSquared = PIN_DISTANCE * PIN_DISTANCE - 0.01

  // A ordenação por ID evita deslocamentos aleatórios entre renderizações.
  for (const feature of [...points].sort((a, b) => a.properties.id.localeCompare(b.properties.id))) {
    const origin = project(feature.geometry.coordinates)
    if (!Number.isFinite(origin.x) || !Number.isFinite(origin.y)) continue

    const candidate = OFFSETS
      .map(offset => ({ x: origin.x + offset.x, y: origin.y + offset.y }))
      .find(isFree)

    if (!candidate) {
      // Segurança: nunca descartar um ponto real, mesmo em densidades extremas.
      pins.push(feature)
      continue
    }
    register(candidate)
    const moved = Math.hypot(candidate.x - origin.x, candidate.y - origin.y)
    if (moved < 1) {
      pins.push(feature)
      continue
    }
    const coords = unproject([candidate.x, candidate.y])
    if (!Number.isFinite(coords.lng) || !Number.isFinite(coords.lat)) {
      pins.push(feature)
      continue
    }
    const location: [number, number] = [coords.lng, coords.lat]
    pins.push({ ...feature, geometry: { type: 'Point', coordinates: location } })
    if (moved >= 5) {
      leaders.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [feature.geometry.coordinates, location] },
        properties: { id: feature.properties.id },
      })
      anchors.push(feature)
    }
  }
  return { pins, leaders, anchors }
}
