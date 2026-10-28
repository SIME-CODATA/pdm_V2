import prefeituraLogo from '@/assets/images/logo_PrefSP_sem fundo_horizontal_preto_monocromático.png'
import simeLogo from '@/assets/images/sime.svg'
import cpmaLogo from '@/assets/images/cpma.svg'
import codataLogo from '@/assets/images/codata.svg'

import facebookIcon from '@/assets/icons/facebook.svg'
import instagramIcon from '@/assets/icons/instagram.svg'
import twitterIcon from '@/assets/icons/tt.svg'
import youtubeIcon from '@/assets/icons/youtube.svg'

export const footerContent = {
  signature: 'PREFEITURA DE SP: AQUI O TRABALHO NÃO PARA',

  logos: {
    prefeitura: {
      src: prefeituraLogo,
      alt: 'Prefeitura de São Paulo',
    },
    sime: {
      src: simeLogo,
      alt: 'SIME',
    },
    cpma: {
      src: cpmaLogo,
      alt: 'CPMA',
    },
    codata: {
      src: codataLogo,
      alt: 'CODATA',
    },
  },

  social: [
    {
      label: 'Facebook',
      iconUrl: facebookIcon,
    },
    {
      label: 'X',
      iconUrl: twitterIcon,
    },
    {
      label: 'Instagram',
      iconUrl: instagramIcon,
    },
    {
      label: 'YouTube',
      iconUrl: youtubeIcon,
    },
  ],

  institutional: {
    description: 'O Programa de Metas é uma elaboração da SIME',
    department: 'Secretaria de Informações e Monitoramento Estratégicos.',
    websiteUrl: 'https://prefeitura.sp.gov.br/web/planejamento/',
    websiteLabel: 'Acesse o site da secretaria para mais informações',
  },
} as const
