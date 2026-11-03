import type { MetaSummary } from '../api/metas.schemas'
export const normalizar = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
export function sameName(a: string, b: string) {
  return normalizar(a) === normalizar(b)
}
export function uniq(items: string[]) {
  return [...new Set(items)].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
export const match = (actual: string[], filter: string) =>
  !filter || actual.some((x) => sameName(x, filter))
export function searchMatches(meta: MetaSummary, query: string) {
  const words = normalizar(query)
  return (
    !words ||
    normalizar([meta.numero, meta.codigo, meta.titulo, meta.eixo.nome].join(' ')).includes(words)
  )
}
export function axisColor(meta: MetaSummary) {
  return /^#[\da-f]{6}$/i.test(meta.eixo.cor_principal || '') ? meta.eixo.cor_principal! : '#0079AB'
}
// region status and territorial coverage are independent fields!
export function territorialStatus(meta: MetaSummary) {
  if (!meta.regionalizada) return 'nonregionalized'
  if (!meta.subprefeituras.length) return 'without-territory'
  return 'mapped'
}
export interface ActiveFilters {
  search: string
  regional: 'all' | 'regionalized' | 'nonregionalized'
  region: string
  subprefeitura: string
  eixo: string
  orgao: string
  plano: string
}
export const emptyFilters: ActiveFilters = {
  search: '',
  regional: 'all',
  region: '',
  subprefeitura: '',
  eixo: '',
  orgao: '',
  plano: '',
}
export function applyBaseFilters(metas: MetaSummary[], filter: ActiveFilters) {
  return metas.filter((meta) => {
    if (filter.regional === 'regionalized' && !meta.regionalizada) return false
    if (filter.regional === 'nonregionalized' && meta.regionalizada) return false
    if (
      !searchMatches(meta, filter.search) ||
      !match(meta.regioes, filter.region) ||
      !match(meta.subprefeituras, filter.subprefeitura) ||
      (filter.eixo && !sameName(meta.eixo.nome, filter.eixo))
    )
      return false
    if (filter.orgao && (!meta.orgaos || !match(meta.orgaos, filter.orgao))) return false
    if (filter.plano && (!meta.planos_vinculados || !match(meta.planos_vinculados, filter.plano)))
      return false
    return true
  })
}
