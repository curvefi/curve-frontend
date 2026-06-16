import { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'
import { get } from 'lodash'
import { assert } from '@primitives/objects.utils'

const CDN_ROOT_URL = 'https://cdn.jsdelivr.net'
export const CURVE_CDN_URL = `${CDN_ROOT_URL}/gh/curvefi`
export const CURVE_ASSETS_URL = `${CURVE_CDN_URL}/curve-assets`
export const CURVE_LOGO_URL = `${CURVE_ASSETS_URL}/branding/logo.png`
export const CURVE_LOGO_GRAYSCALE_URL = `${CURVE_ASSETS_URL}/branding/logo-bw.svg`
export const ERROR_IMAGE_URL = `${CURVE_ASSETS_URL}/branding/four-oh-llama.jpg`

/** Dot-path union of every URL leaf in EXTERNAL_LINKS, e.g. "brand.assets". */
export type ExternalLinkKey<T = typeof EXTERNAL_LINKS, Prefix extends string = ''> = {
  [Key in keyof T & string]: T[Key] extends string
    ? `${Prefix}${Key}`
    : T[Key] extends object
      ? ExternalLinkKey<T[Key], `${Prefix}${Key}.`>
      : never
}[keyof T & string]

export const CURVE_SOCIALS = {
  twitter: 'https://x.com/curvefinance',
  discord: 'https://discord.gg/rgrfS7W',
  telegram: {
    en: 'https://t.me/curvefi',
    cn: 'https://t.me/curveficn',
    ru: 'https://t.me/crvrussianchat',
    announcements: 'https://t.me/curvefiann',
    llamalendMonitorBot: 'https://t.me/LlamalendMonitorBot',
  },
  youtube: {
    en: 'https://www.youtube.com/@CurveFinanceChannel',
    cn: 'https://www.youtube.com/watch?v=FtzDlWdcou8&list=PLh7yM-DPEDYgP-vyEOCIboD3xg_TgJmkj',
  },
  dodo: 'https://imdodo.com/s/147186?inv=7J46',
}

/** External links related to Curve. */
export const EXTERNAL_LINKS = {
  curve: {
    root: 'https://www.curve.finance/',
    classic: 'https://classic.curve.finance/',
    gov: 'https://gov.curve.finance/',
    news: 'https://news.curve.finance/',
    docs: 'https://docs.curve.finance/',
    chinese: {
      wiki: 'https://www.curve.wiki/',
    },
  },
  docs: {
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
      scrvUsdAudit: 'https://docs.curve.finance/assets/pdf/ChainSecurity_Curve_scrvUSD_audit.pdf',
    },
    crvUsd: {
      amm: 'https://docs.curve.finance/crvUSD/amm/',
      oracle: 'https://docs.curve.finance/crvUSD/oracle/',
      pegKeepers: 'https://docs.curve.finance/crvUSD/pegkeepers/overview/',
    },
    scrvUsd: {
      overview: 'https://docs.curve.finance/scrvusd/overview/',
    },
    yearn: {
      v3Vaults: 'https://docs.yearn.fi/developers/v3/overview',
    },
  },
  etherscan: {
    curveEmergencyAdmin: 'https://etherscan.io/address/0x467947EE34aF926cF1DCac093870f613C96B1E0c',
  },
  github: {
    curvefi: 'https://github.com/curvefi',
    llammaSimulator: 'https://github.com/curvefi/llamma-simulator',
    crvUsdSimulator: 'https://github.com/0xreviews/crvusdsim',
    yearnVaultsV3Audits: 'https://github.com/yearn/yearn-vaults-v3/tree/master/audits',
  },
  brand: {
    assets: 'https://curvefinance.notion.site/Brand-Assets-1a6599aae064802fba11ce6a9e642d74',
  },
  legal: {
    privacyPolicies: {
      x: 'https://x.com/en/privacy',
      google: 'https://policies.google.com/privacy?hl=en',
    },
    swissFdpic: 'http://www.edoeb.admin.ch',
    sanctionsAddressSearch:
      'https://www.seco.admin.ch/seco/de/home/Aussenwirtschaftspolitik_Wirtschaftliche_Zusammenarbeit/Wirtschaftsbeziehungen/exportkontrollen-und-sanktionen/sanktionen-embargos/sanktionsmassnahmen/suche_sanktionsadressaten.html',
  },
  monitoring: {
    curveMonitor: 'https://curvemonitor.com/',
    crvHub: 'https://crvhub.com/',
    apiStatus: 'https://statuspage.freshping.io/59335-CurveAPI',
  },
} as const

/** Resolves a typed EXTERNAL_LINKS dot-path to its URL. */
export const getExternalLink = (link: ExternalLinkKey) => {
  const value = get(EXTERNAL_LINKS, link)
  return assert(typeof value === 'string' && value, `Unknown external link: ${link}`)
}

export const getImageBaseUrl = (blockchainId: string) =>
  `${CURVE_ASSETS_URL}/images/assets${!blockchainId || blockchainId == 'ethereum' ? '' : `-${blockchainId}`}/`

/** Key: old name, value: new name */
export const BLOCKCHAIN_LEGACY_NAMES: Record<string, string> = {
  gnosis: 'xdai',
}

export const getBlockchainIconUrl = (blockchainId: string, theme?: 'dark') =>
  `${CURVE_ASSETS_URL}/chains/${BLOCKCHAIN_LEGACY_NAMES[blockchainId] ?? blockchainId}${theme ? `-${theme}` : ''}.png`

export const getBackgroundUrl = (theme: ThemeKey) => `${CURVE_ASSETS_URL}/branding/curve_illustration-${theme}.svg`
