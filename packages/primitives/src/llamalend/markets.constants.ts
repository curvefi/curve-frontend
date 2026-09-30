import type { Address } from '../address.utils'
import { Chain } from '../network.utils'
import type { PartialRecord } from '../objects.utils'

/** TODO: This shouldn't live in the primitives package, move it to the router api and fetch markets assets from there */

export enum MarketAssetsType {
  Correlated = 'correlated', // Assets expected to maintain a close price relationship.
  BlueChip = 'blue-chip', // A pair of established assets with deep and reliable liquidity and substantial trading activity.
  LongTail = 'long-tail', // A pair involving at least one less-established asset with relatively shallow liquidity and limited trading activity.
}

/** Assets types for markets shown in the default Mint and Lend lists. Unlisted markets have no defined assets type. */
export const MARKET_ASSETS_TYPE_BY_CONTROLLER: PartialRecord<number, Record<Address, MarketAssetsType>> = {
  [Chain.Ethereum]: {
    // Lend markets
    '0xFd85e847cDd2549f213E276e4B57B0690169F043': MarketAssetsType.LongTail, // svZCHF/crvUSD
    '0x2fb54c8eae57767A9A509A395b9C4FA0702e2675': MarketAssetsType.Correlated, // syrupUSDC/crvUSD
    '0x3cD4d86a2c65e57ce4b4121b67E2D2224BA41bbe': MarketAssetsType.Correlated, // sfrxUSD/crvUSD v2
    '0xC77d97cF01737EB7aCE46cAb7cd9F60eC51a40c0': MarketAssetsType.Correlated, // sDOLA/crvUSD v2
    '0x4F79Fe450a2BAF833E8f50340BD230f5A3eCaFe9': MarketAssetsType.Correlated, // sreUSD/crvUSD
    '0x8035b16053560b3C351b665b10f6C7dBDb6A1E05': MarketAssetsType.Correlated, // fxSAVE/crvUSD
    '0x2dA313f6DCEE04BA46466E100c4656618E5d3dDd': MarketAssetsType.Correlated, // sUSDS/crvUSD
    '0x3DE37c38739dFb83b7A902842bF5393040f7BF50': MarketAssetsType.Correlated, // sfrxUSD/crvUSD
    '0xB4544e705665e0856961a51F7E86Ccf633404b86': MarketAssetsType.LongTail, // XAUM/crvUSD
    '0x5756A035F276a8095A922931F224F4ed06149608': MarketAssetsType.BlueChip, // wstETH/crvUSD
    '0x23F5a668A9590130940eF55964ead9787976f2CC': MarketAssetsType.BlueChip, // WETH/crvUSD
    '0xB536FEa3a01c95Dd09932440eC802A75410139D6': MarketAssetsType.Correlated, // sUSDe/crvUSD
    '0xcaD85b7fe52B1939DCEebEe9bCf0b2a5Aa0cE617': MarketAssetsType.BlueChip, // WBTC/crvUSD
    '0x413FD2511BAD510947a91f5c6c79EBD8138C29Fc': MarketAssetsType.BlueChip, // tBTC/crvUSD
    '0xaade9230AA9161880E13a38C83400d3D1995267b': MarketAssetsType.BlueChip, // WETH/crvUSD
    // Mint markets
    '0xf8C786b1064889fFd3c8A08B48D5e0c159F4cBe3': MarketAssetsType.BlueChip, // cbBTC/crvUSD
    '0x652aEa6B22310C89DCc506710CaD24d2Dba56B11': MarketAssetsType.BlueChip, // weETH/crvUSD
    '0x1C91da0223c763d2e0173243eAdaA0A2ea47E704': MarketAssetsType.BlueChip, // tBTC/crvUSD
    '0xEC0820EfafC41D8943EE8dE495fC9Ba8495B15cf': MarketAssetsType.BlueChip, // sfrxETH/crvUSD
    '0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635': MarketAssetsType.BlueChip, // WETH/crvUSD
    '0x4e59541306910aD6dC1daC0AC9dFB29bD9F15c67': MarketAssetsType.BlueChip, // WBTC/crvUSD
    '0x100dAa78fC509Db39Ef7D04DE0c1ABD299f4C6CE': MarketAssetsType.BlueChip, // wstETH/crvUSD
  },
  [Chain.Optimism]: {
    '0xb5EC7A3D591877A66BE4f3eafdC4205E98A1BCAA': MarketAssetsType.BlueChip, // wstETH/USDC v2
    '0x9fC15ac3EF97093832f49B7997A58E29b49C56dE': MarketAssetsType.BlueChip, // WBTC/USDC v2
    '0x745422BF49f3F6e4A8E12E4abD19339E7910F8C9': MarketAssetsType.Correlated, // wstETH/WETH v2
  },
  [Chain.Arbitrum]: {
    '0xb9aDddCf4e01c2f64F8F2CD9a050DC35585ea053': MarketAssetsType.BlueChip, // WBTC/crvUSD
    '0xB5c6082d3307088C98dA8D79991501E113e6365d': MarketAssetsType.BlueChip, // WETH/crvUSD
    '0x88f88e937Db48bBfe8E3091718576430704e47Ab': MarketAssetsType.LongTail, // CRV/crvUSD
    '0x013be86e1cdb0f384dAF24Bd974FE75EdFfe6B68': MarketAssetsType.BlueChip, // WBTC/crvUSD
    '0xB5B6f0E69c283AA32425FA18220e64283B51F0A4': MarketAssetsType.BlueChip, // WETH/crvUSD
  },
  [Chain.Fraxtal]: {
    '0xB4EbF87A474569d8eB7f7182B4beBD8aE79ae675': MarketAssetsType.Correlated, // sfrxUSD/crvUSD
    '0xc68f91FfA2B27147F9AB153267018f5Fe4b6850F': MarketAssetsType.BlueChip, // sfrxETH/crvUSD
  },
}
