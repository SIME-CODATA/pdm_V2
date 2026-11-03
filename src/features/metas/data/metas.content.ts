export const metasContent = {
  title: 'Conheça as Metas',
  description:
    'Explore o Programa de Metas 2025–2028 por território, eixo, órgão e plano vinculado.',
  mapTitle: 'Visualização regionalizada',
  searchPlaceholder: 'Pesquise por termos...',
  noResults: 'Nenhuma meta corresponde aos filtros selecionados.',
  noGeo:
    'Sem geometrias territoriais disponíveis. Carregue a camada GeoJSON de subprefeituras para habilitar o filtro espacial.',
  nonRegionalizedTint: '#0079AB26',
  mapStyle: 'https://tiles.openfreemap.org/styles/liberty',
  axes: [
    { name: 'Universo SP', color: '#3DB54A' },
    { name: 'Viver São Paulo', color: '#F16622' },
    { name: 'Cidade Empreendedora', color: '#0000AB' },
    { name: 'Capital do Futuro', color: '#792D49' },
  ],
} as const
export type RegionalizationFilter = 'all' | 'regionalized' | 'nonregionalized'
