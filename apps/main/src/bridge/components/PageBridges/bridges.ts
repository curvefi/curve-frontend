import { t } from '@ui-kit/lib/i18n'
import type { Partner } from '@ui-kit/shared/ui/PartnerCard'

const TAGS_RECOMMENDED = ['Recommended']

export const WEB3_BRIDGES: Partner[] = [
  {
    name: 'CrossCurve',
    description: t`A decentralized and unified infrastructure for cross-chain liquidity and incentives, powered by Curve AMM.`,
    imageId: 'platforms/cross-curve.png',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    tags: TAGS_RECOMMENDED,
    appUrl:
      'https://app.crosscurve.fi/swap?inputChainId=7&inputToken=0x498bf2b1e120fed3ad3d42ea2165e9b73f99c1e5&outputChainId=13&utm_source=Curve+Finance&utm_medium=web&utm_campaign=Curve+Bridge+Page',
    twitterUrl: 'https://x.com/crosscurvefi',
  },
  {
    name: 'deBridge',
    description: t`Messaging and cross-chain interoperability protocol enabling the building of cross-chain dapps.`,
    imageId: 'platforms/debridge.jpg',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    appUrl: 'https://debridge.com/',
    twitterUrl: 'https://x.com/deBridge',
  },
  {
    name: 'Jumper',
    description: t`Swap and bridge across +20 networks with no fees and best price guarantees.`,
    imageId: 'platforms/jumper.jpg',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    tags: TAGS_RECOMMENDED,
    appUrl: 'https://jumper.exchange/',
    twitterUrl: 'https://x.com/JumperExchange',
  },
  {
    name: 'Across',
    description: t`Fastest and lowest-cost bridging for end-users.`,
    imageId: 'platforms/across.jpg',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    appUrl: 'https://across.to/',
    twitterUrl: 'https://x.com/AcrossProtocol',
  },
  {
    name: 'Synapse',
    description: t`Synapse is the most widely used, extensible, and secure cross-chain communications network.`,
    imageId: 'platforms/synapse.jpg',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    appUrl: 'https://synapseprotocol.com/',
    twitterUrl: 'https://x.com/SynapseProtocol',
  },
  {
    name: 'Squid',
    description: t`Squid powers cross-chain swaps and contract calls across chains in a single click.`,
    imageId: 'platforms/squid.jpg',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    appUrl: 'https://www.squidrouter.com/',
    twitterUrl: 'https://x.com/squidrouter',
  },
  {
    name: 'Layer Zero',
    description: t`Protocol for on-chain cross-communication.`,
    imageId: 'platforms/layerzero.png',
    networks: { ethereum: true, arbitrum: true, optimism: true },
    appUrl: 'https://layerzero.network/',
    twitterUrl: 'https://x.com/layerzero_core',
  },
]

export const NATIVE_BRIDGES: Partner[] = [
  {
    name: 'Arbitrum',
    imageId: 'chains/arbitrum.png',
    appUrl: 'https://arbitrum.io/',
    twitterUrl: 'https://x.com/arbitrum',
  },
  {
    name: 'Avalanche',
    imageId: 'chains/avalanche.png',
    appUrl: 'https://core.app/bridge',
    twitterUrl: 'https://x.com/avax',
  },
  {
    name: 'Celo',
    imageId: 'chains/celo.png',
    appUrl: 'https://mondo.celo.org/bridge',
    twitterUrl: 'https://x.com/Celo',
  },
  {
    name: 'BSC',
    imageId: 'chains/bsc.png',
    appUrl: 'https://www.bnbchain.org/en/bnb-chain-bridge',
    twitterUrl: 'https://x.com/binance',
  },
  {
    name: 'Etherlink',
    imageId: 'chains/etherlink.png',
    appUrl: 'https://bridge.etherlink.com/',
    twitterUrl: 'https://x.com/etherlink',
  },
  {
    name: 'Ink',
    imageId: 'chains/ink.png',
    appUrl: 'https://inkonchain.com/bridge',
    twitterUrl: 'https://x.com/inkonchain',
  },
  {
    name: 'Mantle',
    imageId: 'chains/mantle.png',
    appUrl: 'https://app.mantle.xyz/bridge',
    twitterUrl: 'https://x.com/Mantle_Official',
  },
  {
    name: 'Optimism',
    imageId: 'chains/optimism.png',
    appUrl: 'https://app.optimism.io/bridge',
    twitterUrl: 'https://x.com/Optimism',
  },
  {
    name: 'Plume',
    imageId: 'chains/plume.png',
    appUrl: 'https://portal.plume.org/bridge',
    twitterUrl: 'https://x.com/plumenetwork',
  },
  {
    name: 'Polygon',
    imageId: 'chains/polygon.png',
    appUrl: 'https://portal.polygon.technology/bridge',
    twitterUrl: 'https://x.com/0xPolygon',
  },
  {
    name: 'Sonic',
    imageId: 'chains/sonic.png',
    appUrl: 'https://my.soniclabs.com/bridge',
    twitterUrl: 'https://x.com/SonicLabs',
  },
  {
    name: 'Taiko',
    imageId: 'chains/taiko.png',
    appUrl: 'https://bridge.taiko.xyz/',
    twitterUrl: 'https://x.com/taikoxyz',
  },
]
