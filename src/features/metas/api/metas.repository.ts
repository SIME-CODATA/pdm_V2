import { metaDetailSchema, metasListSchema } from './metas.schemas'
import type { MetaDetail, MetasList } from './metas.schemas'
// Usar proxy /pdm-api no desenvolvimento e o mesmo caminho /api/site em produção.
const apiBase = (import.meta.env.VITE_METAS_API_URL || '/pdm-api/api/site').replace(/\/$/, '')
async function fetchJson(path: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(`${apiBase}/${path}`, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`API de metas: HTTP ${res.status} (${path})`)
  return (await res.json()) as unknown
}
export async function getMetas(signal?: AbortSignal): Promise<MetasList> {
  return metasListSchema.parse(await fetchJson('metas', signal))
}
export async function getMeta(codigo: string, signal?: AbortSignal): Promise<MetaDetail> {
  if (!/^\d{1,3}$/.test(codigo)) throw new Error('Código de meta inválido')
  return metaDetailSchema.parse(
    await fetchJson(`metas/${encodeURIComponent(codigo.padStart(2, '0'))}`, signal),
  )
}
// O esquema dos endpoints /filtros e /mapa não foi fornecido. Preservamos o JSON bruto,
// sem assumir que seus campos representam geometria, IDs ou relacionamentos.
export async function getMetaFilterPayload(signal?: AbortSignal): Promise<unknown> {
  return fetchJson('metas/filtros', signal)
}
export async function getMetaMapPayload(signal?: AbortSignal): Promise<unknown> {
  return fetchJson('metas/mapa', signal)
}
