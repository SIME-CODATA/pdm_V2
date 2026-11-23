import type { Map } from 'maplibre-gl'

/**
 * Aplica apenas um acabamento cartográfico ao OpenFreeMap Liberty.
 *
 * Não altera o GeoJSON, os pins, a câmera, os eventos de zoom ou a seleção
 * territorial. A fonte vetorial continua sendo a mesma, mas as camadas
 * de transporte, estabelecimentos e edificações deixam de ser desenhadas.
 *
 * O critério baseado em source-layer permite acompanhar pequenas mudanças
 * de IDs na versão remota do estilo Liberty.
 */
const OMITTED_SOURCE_LAYERS = new Set([
  
  'transportation_name',  // Nomes de ruas e escudos de rodovias
  'poi',                  // Comércios, terminais e pontos de ônibus
  'aeroway',              // Aeroportos e pistas
  'building',             // Edificações 2D / 3D
  'housenumber',          // Numeração de edifícios
])

// Camadas adicionais com IDs usuais em variantes do Liberty.
// Evita ocultar camadas institucionais pdm-* adicionadas pelo próprio projeto.
const EXTRA_DECORATIVE_LAYER =
  /(?:^|[-_])(?:road|highway|motorway|bridge|tunnel|railway|transit|bus|poi|building|housenumber|aeroway)(?:[-_]|$)/i

export function simplifyPdmBasemap(map: Map): void {
  const style = map.getStyle()

  for (const layer of style.layers ?? []) {
    if (layer.id.startsWith('pdm-')) continue

    const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : undefined
    // Exibe somente ruas locais, sem avenidas,
        // rodovias, ferrovias ou pontes.
        if (sourceLayer === 'transportation') {
        const isRuaLocal =
            layer.type === 'line' &&
            /^road_minor(?:_casing)?$/.test(layer.id)

        map.setLayoutProperty(
            layer.id,
            'visibility',
            isRuaLocal ? 'visible' : 'none'
        )

        continue
        }
    const isOmittedData = typeof sourceLayer === 'string' &&
      OMITTED_SOURCE_LAYERS.has(sourceLayer)

    // Preservamos os nomes dos lugares (ex.: Itaquera, Parelheiros),
    // mas não os rótulos de serviços, parques, hidrografia e comércio.
    const isUnnecessaryLabel = layer.type === 'symbol' && sourceLayer !== 'place'
    const isDecorative = EXTRA_DECORATIVE_LAYER.test(layer.id)

    if (isOmittedData || isUnnecessaryLabel || isDecorative) {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
    }
  }
}
