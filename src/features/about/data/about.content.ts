/**
 * Conteúdo local da página Sobre o PDM.
 * Quando o CMS estiver pronto, a camada de API fornecerá estes mesmos dados.
 * Edite somente este arquivo para trocar textos, imagens, ícones e documentos.
 * A ausência de imagem/URL deve ser representada por null, nunca por um link fictício.
 */

import securytImage from '@/assets/images/seguranca.jpg'
import casaImage from '@/assets/images/casa.svg'
import comidaImage from '@/assets/images/comida.svg'
import ensinoImage from '@/assets/images/ensino.svg'
import naturezaImage from '@/assets/images/natureza.svg'
import saude2Image from '@/assets/images/saude2.svg'
import bookImage from '@/assets/images/livro.svg'
import notbookImage from '@/assets/images/notbook.svg'
import bgImage from '@/assets/images/bg-defundo.svg'
import speakImage from '@/assets/images/conversa.jpg'

export type TopicId = 'security' | 'food' | 'families' | 'education' | 'health' | 'nature'
export type AxisId = 'universo' | 'viver' | 'empreendedora' | 'futuro'
export type TopicIconKey = 'shield' | 'users' | 'house' | 'graduation' | 'health' | 'leaf'
export type AxisIconKey = 'leaf' | 'home' | 'building' | 'bus' | 'construction'

export interface TopicContent {
  id: TopicId
  title: string
  description: string
  imageUrl: string | null
  iconUrl: string | null
  iconKey: TopicIconKey
  accentColor: string
}

export interface AxisContent {
  id: AxisId
  tabLabel: string
  headline: string
  description: string
  color: string
  topics: ReadonlyArray<{ label: string; icon: AxisIconKey }>
  href: string | null
}

export interface TimelineDocument {
  id: string
  title: string
  buttonLabel: string
  url: string | null
}

export interface TimelineYear {
  year: number
  documents: ReadonlyArray<TimelineDocument>
}

/**
 * Assets opcionais: substitua os null pelo import de um arquivo em src/assets
 * ou pela URL devolvida pela API futuramente.
 * Sugestões de nomes estão no README do kit, não são caminhos obrigatórios.
 */
export const aboutAssets = {
  topics: {
    security: securytImage,
    food: comidaImage,
    families: casaImage,
    education: ensinoImage,
    health: saude2Image,
    nature: naturezaImage,
  },
  topicIcons: {
    security: null,
    food: null,
    families: null,
    education: null,
    health: null,
    nature: null,
  },
  reportCover: bookImage,
  monitoringLaptop: notbookImage,
  participationPhoto: speakImage,
  historyBanner: bgImage,
} satisfies {
  topics: Record<TopicId, string | null>
  topicIcons: Record<TopicId, string | null>
  reportCover: string | null
  monitoringLaptop: string | null
  participationPhoto: string | null
  historyBanner: string | null
}

export const aboutContent = {
  introduction: {
    title: 'Sobre o PDM',
    description: 'O Programa de Metas é um instrumento de planejamento que apresenta à população',
    emphasis: 'iniciativas que a gestão procurará realizar ao longo do mandato de quatro anos do prefeito.',
  },
  themes: {
    label: 'TEMAS',
    subtitle: 'As metas propostas no PDM expressam a visão da cidade como um tecido social vivo e dinâmico.',
    initialTopic: 'education' as TopicId,
    items: [
      { id: 'security', title: 'Segurança', description: 'Descrição do tema a ser definida no CMS.', iconKey: 'shield', imageUrl: aboutAssets.topics.security, iconUrl: aboutAssets.topicIcons.security, accentColor: '#434e9c' },
      { id: 'food', title: 'Alimentação', description: 'Descrição do tema a ser definida no CMS.', iconKey: 'users', imageUrl: aboutAssets.topics.food, iconUrl: aboutAssets.topicIcons.food, accentColor: '#4b9e56' },
      { id: 'families', title: 'Famílias', description: 'Descrição do tema a ser definida no CMS.', iconKey: 'house', imageUrl: aboutAssets.topics.families, iconUrl: aboutAssets.topicIcons.families, accentColor: '#812e47' },
      { id: 'education', title: 'Ensino Integral', description: 'Para que os alunos tenham mais oportunidades de dedicação à formação acadêmica e ao desenvolvimento pleno como pessoas.', iconKey: 'graduation', imageUrl: aboutAssets.topics.education, iconUrl: aboutAssets.topicIcons.education, accentColor: '#f49800' },
      { id: 'health', title: 'Saúde', description: 'Descrição do tema a ser definida no CMS.', iconKey: 'health', imageUrl: aboutAssets.topics.health, iconUrl: aboutAssets.topicIcons.health, accentColor: '#0079ab' },
      { id: 'nature', title: 'Meio Ambiente', description: 'Descrição do tema a ser definida no CMS.', iconKey: 'leaf', imageUrl: aboutAssets.topics.nature, iconUrl: aboutAssets.topicIcons.nature, accentColor: '#479745' },
    ] satisfies ReadonlyArray<TopicContent>,
  },
  axes: {
    label: 'EIXOS',
    title: 'A estrutura do programa',
    subtitle: 'Para dar forma à complexidade do plano e orientar sua leitura, as metas estão divididas em 4 eixos temáticos.',
    initialAxis: 'universo' as AxisId,
    items: [
      {
        id: 'universo', tabLabel: 'Universo SP',
        headline: 'São Paulo em sua dimensão física, natural, territorial',
        description: 'É o eixo que reúne metas relacionadas à preservação da natureza e à intervenção na paisagem urbana. Trata tanto do ambiente natural – rios, córregos, represas, matas – quanto do ambiente transformado – vias, edificações, moradias.',
        color: '#4B9E56',
        topics: [
          {label:'Natureza',icon:'leaf'}, {label:'Habitação',icon:'home'},
          {label:'Infraestrutura',icon:'building'}, {label:'Mobilidade',icon:'bus'},
          {label:'Requalificação Urbana',icon:'construction'},
        ],
        href: null,
      },
      {
        id: 'viver', tabLabel: 'Viver São Paulo',
        headline: 'Viver São Paulo',
        description: 'Texto de apresentação deste eixo a ser fornecido pelo CMS.',
        color: '#F49800', topics: [], href: null,
      },
      {
        id: 'empreendedora', tabLabel: 'Cidade Empreendedora',
        headline: 'Cidade Empreendedora',
        description: 'Texto de apresentação deste eixo a ser fornecido pelo CMS.',
        color: '#812E47', topics: [], href: null,
      },
      {
        id: 'futuro', tabLabel: 'Capital do Futuro',
        headline: 'Capital do Futuro',
        description: 'Texto de apresentação deste eixo a ser fornecido pelo CMS.',
        color: '#2D2C86', topics: [], href: null,
      },
    ] satisfies ReadonlyArray<AxisContent>,
  },
  construction: {
    label: 'CONSTRUÇÃO',
    title: 'Como se faz um Programa de Metas?',
    benefits: [
      'Transparência em todas as etapas',
      'Cooperação entre os agentes',
      'Otimização de recursos',
    ],
    lead: 'O PdM é elaborado de acordo com uma série de normas legais.',
    description: 'Tem início com reuniões entre as secretarias, passa pela divulgação da versão inicial das metas, é levado a debate com a sociedade e chega à sua versão final, cuja execução é monitorada e eventualmente alterada nos prazos e formas definidos em lei.',
    imageUrl: aboutAssets.reportCover,
  },
  timeline: {
    title: 'Cronograma ao longo dos 4 anos',
    initialYear: 2025,
    years: [
      { year: 2025, documents: [
        { id: 'relatorio-2025', title: '1º Relatório de Execução Anual do PdM 2025-2028 (Exercício 2025).', buttonLabel: 'Baixar Relatório de Execução', url: null },
      ] },
      { year: 2026, documents: [
        { id: 'balanco-2026', title: 'Balanço semestral (1º sem./26) do PdM 2025-2028.', buttonLabel: 'Baixar Balanço Semestral', url: null },
      ] },
      { year: 2027, documents: [] },
      { year: 2028, documents: [] },
    ] satisfies ReadonlyArray<TimelineYear>,
  },
  monitoring: {
    label: 'MONITORAMENTO',
    imageUrl: aboutAssets.monitoringLaptop,
    lead: 'É possível acompanhar o desempenho de uma meta a qualquer momento na página de listagem completa das metas ou nos balanços e relatórios divulgados semestralmente.',
    firstButton: 'Encontre as metas',
    firstHref: null,
    title: 'Indicadores',
    description: 'Os resultados apurados são medidos por indicadores que dão a medida do avanço na execução do PdM.',
    complement: 'Eles sinalizam, conforme o tipo de meta, os recursos empregados nela, a entrega final feita à população, os resultados mais imediatos dessa entrega ou o impacto da meta cumprida na vida da cidade.',
    secondButton: 'Veja a lista completa de indicadores',
    secondHref: null,
  },
  participation: {
    title: 'Participação social',
    imageUrl: aboutAssets.participationPhoto,
    paragraph1: 'O ciclo participativo envolve a realização de audiências públicas e o envio de sugestões e opiniões pelos cidadãos por meio da plataforma digital Participe+.',
    paragraph2: 'Todas as contribuições são sistematizadas e avaliadas tecnicamente pelas equipes da Prefeitura.',
    youtubeNote: 'O conteúdo das audiências está no canal da Prefeitura no Youtube.',
    youtubeUrl: null,
    audiencesTitle: 'Audiências públicas',
    audiencesText: 'O diálogo com a sociedade é um momento essencial do PDM. Confira alguns dados dessa etapa:',
    responsesTitle: 'Devolutivas',
    responsesText: 'Conheça também as contribuições da sociedade e as respostas dos órgãos responsáveis na Página de Devolutivas.',
    responsesUrl: null,
    stats: [
      { number: '01', label: 'Audiência geral' },
      { number: '03', label: 'Audiências temáticas' },
      { number: '32', label: 'Encontros nas subprefeituras' },
      { number: '2.243', label: 'Participações (online e presencial)' },
      { number: '31.245', label: 'Colaborações registradas' },
    ],
  },
  history: {
    banner: 'A cultura do planejamento estratégico está enraizada na Prefeitura de São Paulo.',
    imageUrl: aboutAssets.historyBanner,
    lead: 'O PdM foi incorporado à Lei Orgânica do Município (LOM) em 2008.',
    paragraph: 'Os sucessivos programas elaborados desde então constituem um acervo de experiências acumuladas que contribuem para o aperfeiçoamento da gestão pública baseada em dados verificáveis e indicadores precisos.',
    callout: 'Veja a lista completa de PdMs criados para a Cidade de São Paulo',
    button: 'Histórico de PdMs',
    href: null,
  },
} as const
