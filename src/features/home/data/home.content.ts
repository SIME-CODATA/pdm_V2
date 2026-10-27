/**
 * Conteúdo temporário baseado no Figma.
 * Futuramente o CMS/API substituirá estes valores sem alterar as seções.
 *
 * As imagens são opcionais. Quando os arquivos estiverem disponíveis,
 * coloque-os em public/images/home e informe a URL, como:
 * imageUrl: '/images/home/planejamento.webp'
 *
 * Não utilize texto ou notícias provisórias como publicação oficial.
 */

export interface HomeGovernanceContent {
  heading: string
  description: string
  backgroundImageUrl: string | null
  highlights: ReadonlyArray<{
    id: 'transparency' | 'cooperation' | 'resources'
    label: string
  }>
  moreUrl: string | null
}

export interface HomeMayorContent {
  quote: string
  attribution: string
  dateLabel: string
  fullText: string | null
}

export type HomeGoalIcon = 'environment' | 'education' | 'health' | 'security'

export interface HomeGoalContent {
  id: HomeGoalIcon
  count: number
  label: string
  imageUrl: string | null
}

export interface HomeNewsContent {
  title: string
  summary: string
  date: string
  dateLabel: string
  imageUrl: string | null
  articleUrl: string | null
}

export const homeContent: {
  governance: HomeGovernanceContent
  mayor: HomeMayorContent
  goals: readonly HomeGoalContent[]
  news: HomeNewsContent
} = {
  governance: {
    heading: 'Planejamento, gestão e governança participativa',
    description:
      'No Programa de Metas aliam-se o planejamento técnico da gestão e a governança participativa. É uma ferramenta de análise de desempenho, de monitoramento de ações, de fiscalização e de transparência.',
    backgroundImageUrl: null,
    highlights: [
      { id: 'transparency', label: 'Transparência em todas as etapas' },
      { id: 'cooperation', label: 'Cooperação entre os agentes' },
      { id: 'resources', label: 'Otimização de recursos' },
    ],
    moreUrl: null,
  },
  mayor: {
    quote:
      'A Prefeitura adquiriu a condição de formular e executar políticas públicas de maneira estruturada, a médio e longo prazo, e ao mesmo tempo oferecer respostas às necessidades urgentes da capital.',
    attribution: 'Ricardo Nunes, prefeito de São Paulo',
    dateLabel: 'setembro de 2025',
    // O texto completo não consta das capturas fornecidas.
    // Preencher somente com o conteúdo institucional correto.
    fullText: null,
  },
  goals: [
    {
      id: 'environment',
      count: 25,
      label: 'Meio Ambiente e Sustentabilidade',
      imageUrl: null,
    },
    {
      id: 'education',
      count: 48,
      label: 'Educação Básica, Fundamental e Superior',
      imageUrl: null,
    },
    {
      id: 'health',
      count: 74,
      label: 'Saúde, Odontologia e Psicologia',
      imageUrl: null,
    },
    {
      id: 'security',
      count: 74,
      label: 'Segurança e Policiamento',
      imageUrl: null,
    },
  ],
  news: {
    // Conteúdo de demonstração transcrito do layout do Figma, não consultado na API.
    title:
      'Com investimento de R$ 34,3 milhões, Prefeitura entrega melhorias do Complexo Viário João Beicola para beneficiar 196 mil pessoas',
    summary:
      'Intervenções contribuem para a fluidez, redistribuindo o tráfego e facilitando os acessos à região de Interlagos',
    date: '2026-09-07',
    dateLabel: '07/09/2026',
    imageUrl: null,
    articleUrl: null,
  },
}
