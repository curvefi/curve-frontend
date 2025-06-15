import { Chain as ChainId } from '@ui-kit/utils/network'

/**
 * Fallback RPC URLs for each chain to improve wallet connection resilience.
 */
export const RPC: Record<ChainId, string[]> = {
  [ChainId.Ethereum]: ['https://eth.drpc.org', 'https://eth-pokt.nodies.app', 'https://eth.blockrazor.xyz'],
  [ChainId.Arbitrum]: ['https://arb1.arbitrum.io/rpc', 'https://1rpc.io/arb'],
  [ChainId.Avalanche]: ['https://api.avax.network/ext/bc/C/rpc'],
  [ChainId.Base]: ['https://mainnet.base.org'],
  [ChainId.Bsc]: ['https://56.rpc.thirdweb.com'],
  [ChainId.Celo]: ['https://forno.celo.org'],
  [ChainId.Fantom]: ['https://250.rpc.thirdweb.com'],
  [ChainId.Fraxtal]: ['https://rpc.frax.com'],
  [ChainId.Gnosis]: ['https://rpc.gnosischain.com'],
  [ChainId.Kava]: ['https://evm.kava.io'],
  [ChainId.Optimism]: ['https://mainnet.optimism.io'],
  [ChainId.Polygon]: ['https://polygon-rpc.com'],
  [ChainId.Moonbeam]: ['https://moonbeam.public.blastapi.io'],
  [ChainId.Mantle]: ['https://rpc.mantle.xyz'],
  [ChainId.Sonic]: ['https://rpc.soniclabs.com'],
  [ChainId.XLayer]: ['https://rpc.xlayer.tech'],
  [ChainId.Aurora]: ['https://mainnet.aurora.dev'],
  [ChainId.Corn]: ['https://rpc.ankr.com/corn_maizenet', 'https://mainnet.corn-rpc.com'],
  [ChainId.Taiko]: ['https://rpc.ankr.com/taiko', 'https://taiko.drpc.org'],
  [ChainId.Ink]: ['https://rpc-gel.inkonchain.com', 'https://ink.drpc.org'],
  [ChainId.Hyperliquid]: ['https://rpc.hyperliquid.xyz/evm', 'https://rpc.hypurrscan.io'],
  [ChainId.Plume]: ['https://rpc.plume.org'],
  [ChainId.Xdc]: ['https://rpc1.xinfin.network', 'https://rpc.xdcrpc.com'],
  [ChainId.Tac]: ['https://turin.rpc.tac.build'],
  [ChainId.MegaEth]: ['https://carrot.megaeth.com/rpc'],
  [ChainId.Strata]: ['https://stratareth3666f0713.devnet-annapurna.stratabtc.org'],
  [ChainId.ExpChain]: ['https://rpc0-testnet.expchain.ai'],
  [ChainId.ZkSync]: ['https://zksync.drpc.org', 'https://mainnet.era.zksync.io'],
} as const
