import { z } from 'zod'
const listAxis = z
  .object({
    nome: z.string(),
    cor_principal: z.string().optional(),
    cor_secundaria: z.string().optional(),
    frases: z.array(z.string()).default([]),
  })
  .passthrough()
export const metaSummarySchema = z
  .object({
    codigo: z.string(),
    numero: z.string(),
    titulo: z.string(),
    titulo_destaque: z.string().optional(),
    titulo_complemento: z.string().optional(),
    eixo: listAxis,
    monitoramento: z.string().nullable().optional(),
    regioes: z.array(z.string()).default([]),
    subprefeituras: z.array(z.string()).default([]),
    tem_obras: z.boolean().optional(),
    regionalizada: z.boolean(),
    // Campos opcionais para quando a API ampliar o índice; sem eles não inferimos órgãos/planos
    orgaos: z.array(z.string()).optional(),
    planos_vinculados: z.array(z.string()).optional(),
  })
  .passthrough()
export const metasListSchema = z
  .object({ total: z.number(), metas: z.array(metaSummarySchema) })
  .passthrough()
const location = z
  .object({
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    endereco: z.string().nullable().optional(),
  })
  .passthrough()
  .optional()
const obra = z
  .object({
    id: z.number().optional(),
    codigo: z.string().optional(),
    nome: z.string(),
    subprefeituras: z.array(z.string()).optional(),
    subprefeitura: z.string().optional(),
    regioes: z.array(z.string()).optional(),
    tipo_obra_intervencao: z.string().nullable().optional(),
    equipamento: z.string().nullable().optional(),
    status: z.string().optional(),
    percentual_concluido: z.number().nullable().optional(),
    localizacao: location,
  })
  .passthrough()
const projeto = z
  .object({
    id: z.number().optional(),
    codigo: z.string().optional(),
    nome: z.string(),
    portfolio: z.string().nullable().optional(),
    etapa: z.string().nullable().optional(),
    localizacao: location,
  })
  .passthrough()
export const metaDetailSchema = metaSummarySchema
  .omit({ regionalizada: true, regioes: true, subprefeituras: true })
  .extend({
    regionalizada: z.boolean().optional(),
    regioes: z.array(z.string()).optional(),
    subprefeituras: z.array(z.string()).optional(),
    projecao: z.string().nullable().optional(),
    orgaos_responsaveis: z.array(z.string()).default([]),
    acoes_estrategicas: z.array(z.unknown()).default([]),
    monitoramento: z
      .union([
        z.string(),
        z
          .object({
            status: z.string().optional(),
            indicador: z.string().optional(),
            evolucao: z.string().optional(),
            resultados_apurados: z
              .array(
                z
                  .object({
                    valor: z.string(),
                    mes: z.string().optional(),
                    ano: z.number().optional(),
                    data: z.string().optional(),
                  })
                  .passthrough(),
              )
              .default([]),
          })
          .passthrough(),
      ])
      .optional(),
    regionalizacao: z
      .object({
        modo: z.string().optional(),
        nota: z.string().nullable().optional(),
        blocos: z
          .array(
            z
              .object({
                titulo: z.string().optional(),
                imagem: z.string().nullable().optional(),
                texto: z.string().optional(),
                rodape: z.string().optional(),
              })
              .passthrough(),
          )
          .optional(),
      })
      .passthrough()
      .optional(),
    territorios: z
      .object({
        regioes: z.array(z.string()).default([]),
        subprefeituras: z.array(z.string()).default([]),
      })
      .passthrough()
      .optional(),
    obras_associadas: z.array(obra).default([]),
    projetos_associados: z.array(projeto).default([]),
    classificacoes: z
      .object({
        orgaos: z
          .array(
            z
              .object({
                sigla: z.string(),
                descricao: z.string().optional(),
                responsavel: z.boolean().optional(),
              })
              .passthrough(),
          )
          .optional(),
        tags: z.array(z.string()).optional(),
        ods: z.array(z.string()).optional(),
      })
      .passthrough()
      .optional(),
    orcamento: z
      .object({
        previsao: z.string().nullable().optional(),
        empenhado: z.string().nullable().optional(),
        liquidado: z.string().nullable().optional(),
        atualizado_em: z.string().nullable().optional(),
      })
      .passthrough()
      .optional(),
    status_smae: z
      .object({
        andamento: z.string().optional(),
        situacao: z.string().optional(),
        previsao: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
export type MetaSummary = z.infer<typeof metaSummarySchema>
export type MetaDetail = z.infer<typeof metaDetailSchema>
export type MetasList = z.infer<typeof metasListSchema>
