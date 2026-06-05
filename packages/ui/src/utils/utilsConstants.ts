import { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'

const CDN_ROOT_URL = 'https://cdn.jsdelivr.net'
export const CURVE_CDN_URL = `${CDN_ROOT_URL}/gh/curvefi`
export const CURVE_ASSETS_URL = `${CURVE_CDN_URL}/curve-assets`
export const CURVE_LOGO_URL = `${CURVE_ASSETS_URL}/branding/logo.png`
export const ERROR_IMAGE_URL = `${CURVE_ASSETS_URL}/branding/four-oh-llama.jpg`

export const CURVE_SOCIALS = {
  twitter: 'https://x.com/curvefinance',
  discord: 'https://discord.gg/rgrfS7W',
  telegram: {
    en: 'https://t.me/curvefi',
    cn: 'https://t.me/curveficn',
    ru: 'https://t.me/crvrussianchat',
    announcements: 'https://t.me/curvefiann',
  },
  youtube: {
    en: 'https://www.youtube.com/@CurveFinanceChannel',
    cn: 'https://www.youtube.com/watch?v=FtzDlWdcou8&list=PLh7yM-DPEDYgP-vyEOCIboD3xg_TgJmkj',
  },
  dodo: 'https://imdodo.com/s/147186?inv=7J46',
}

export const EXTERNAL_LINKS = {
  docs: {
    root: 'https://docs.curve.finance/',
    user: {
      llamalend: {
        overview: 'https://docs.curve.finance/user/llamalend/overview',
      },
      security: {
        audits: 'https://docs.curve.finance/user/security/audits',
        bugBounty: 'https://docs.curve.finance/user/security/bug-bounty',
      },
    },
    references: {
      whitepaper: 'https://docs.curve.finance/references/whitepaper',
    },
    assets: {
      crvUsdWhitepaper: 'https://docs.curve.finance/assets/pdf/whitepaper_curve_stablecoin.pdf',
    },
  },
  curve: {
    root: 'https://www.curve.finance/',
    classic: 'https://classic.curve.finance/',
    gov: 'https://gov.curve.finance/',
  },
  news: 'https://news.curve.finance/',
  github: {
    curvefi: 'https://github.com/curvefi',
  },
  brand: {
    assets: 'https://curvefinance.notion.site/Brand-Assets-1a6599aae064802fba11ce6a9e642d74',
  },
  security: {
    curveMonitor: 'https://curvemonitor.com/',
    crvHub: 'https://crvhub.com/',
    apiStatus: 'https://statuspage.freshping.io/59335-CurveAPI',
  },
  analytics: {
    duneCurveFi: 'https://dune.com/mrblock_buidl/Curve.fi',
  },
  wiki: {
    curve: 'https://www.curve.wiki/',
  },
} as const

export const getImageBaseUrl = (blockchainId: string) =>
  `${CURVE_ASSETS_URL}/images/assets${!blockchainId || blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`

/** Key: old name, value: new name */
export const BLOCKCHAIN_LEGACY_NAMES: Record<string, string> = {
  gnosis: 'xdai',
}

export const getBlockchainIconUrl = (blockchainId: string, theme?: 'dark') =>
  `${CURVE_ASSETS_URL}/chains/${BLOCKCHAIN_LEGACY_NAMES[blockchainId] ?? blockchainId}${theme ? `-${theme}` : ''}.png`

export const getBackgroundUrl = (theme: ThemeKey) => `${CURVE_ASSETS_URL}/branding/curve_illustration-${theme}.svg`
