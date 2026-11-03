import { useQuery } from '@tanstack/react-query'
import { getMeta, getMetas, getMetaFilterPayload, getMetaMapPayload } from '../api/metas.repository'
export const useMetas = () =>
  useQuery({
    queryKey: ['pdm-v2', 'metas'],
    queryFn: ({ signal }) => getMetas(signal),
    staleTime: 120_000,
    retry: 1,
  })
export const useMeta = (codigo: string | null) =>
  useQuery({
    queryKey: ['pdm-v2', 'metas', codigo],
    queryFn: ({ signal }) => getMeta(codigo!, signal),
    enabled: !!codigo,
    staleTime: 120_000,
    retry: 1,
  })
export const useMetaFiltersPayload = () =>
  useQuery({
    queryKey: ['pdm-v2', 'metas', 'filtros'],
    queryFn: ({ signal }) => getMetaFilterPayload(signal),
    staleTime: 600_000,
    retry: 0,
  })
export const useMetaMapPayload = () =>
  useQuery({
    queryKey: ['pdm-v2', 'metas', 'mapa'],
    queryFn: ({ signal }) => getMetaMapPayload(signal),
    staleTime: 600_000,
    retry: 0,
  })
