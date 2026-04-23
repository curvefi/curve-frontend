import { ReactNode } from 'react'
import { type Chain as ApiChain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { type PartialRecord } from '@primitives/objects.utils'
import { AlertType } from '@ui/AlertBox/types'
import type { TooltipProps } from '@ui/Tooltip/types'
import { t } from '@ui-kit/lib/i18n'
import type { BannerProps } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

type MarketAlert = TooltipProps & {
  alertType: AlertType
  isBorrowDisabled?: boolean // disallow user from creating new borrow positions
  isDepositDisabled?: boolean // disallow user from supply deposit
  // banner message, related to the market situation
  banner?: Omit<BannerProps, 'children'> & { title: ReactNode }
  // action card message, related to action of user
  message?: ReactNode
}

const DEFAULT_DEPRECATE: DeprecatedMarketAlert = { message: t`This market is deprecated.` }
const DEFAULT_ALERT: MarketAlert = {
  alertType: 'danger',
  isBorrowDisabled: true,
  isDepositDisabled: true,
  message: t`This market is deprecated. New borrow positions and deposits are disabled.`,
}

/**
 * Market alerts keep markets visible while surfacing warnings or disabling new borrow/deposit actions.
 * Addresses must be checksummed. Tests have been added to enforce this.
 */
export const MARKETS_ALERTS: Record<
  LlamaMarketType,
  { [chainId: number]: { [controllerAddress: Address]: MarketAlert } }
> = {
  /** LEND MARKET ALERTS */
  Lend: {
    [Chain.Ethereum]: {
      // one-way-market-30 - sDOLA/crvUSD
      '0xaD444663c6C92B497225c6cE65feE2E7F78BFb86': {
        ...DEFAULT_ALERT,
        message: t`This market is deprecated after a donation attack. New borrow positions and deposits are disabled.`,
      },
      // one-way-market-3 - CRV/crvUSD
      '0xEdA215b7666936DEd834f76f3fBC6F323295110A': DEFAULT_ALERT,
      // one-way-market-8 - UwU/crvUSD
      '0x09dBDEB3b301A4753589Ac6dF8A178C7716ce16B': DEFAULT_ALERT,
      // one-way-market-44 - UNIT0/crvUSD
      '0xd15d9797c4ECBf1c97c010327602bC51A09Dfb95': DEFAULT_ALERT,
      // one-way-market-34 - wstUSR/crvUSD
      '0x89707721927d7aaeeee513797A8d6cBbD0e08f41': DEFAULT_ALERT,
    },
    [Chain.Arbitrum]: {
      // one-way-market-7 - FXN/crvUSD
      '0x7Adcc491f0B7f9BC12837B8F5Edf0e580d176F1f': {
        ...DEFAULT_ALERT,
        message: t`Due to small liquidity, borrowing or supplying in this market is not advisable.`,
      },
      // one-way-market-47 - iBTC/crvUSD
      '0x3e293dB65c81742e32b74E21A0787d2936beeDf7': {
        ...DEFAULT_ALERT,
        message: t`iBTC is undergoing systematic unwinding. New borrow positions and deposits are disabled.`,
      },
    },
    [Chain.Fraxtal]: {
      // one-way-market-4 - SQUID/crvUSD
      '0xBF55Bb9463bBbB6aD724061910a450939E248eA6': DEFAULT_ALERT,
      // one-way-market-2 - WFRAX/crvUSD
      '0xf0922934f16DbE5Df9f90F729b2023D5e1FC2F15': DEFAULT_ALERT,
    },
    [Chain.Optimism]: {
      // one-way-market-4 - CRV/crvUSD
      '0x88aa928B906b745009B53A31034701Fc377b7C89': DEFAULT_ALERT,
      // one-way-market-3 - OP/crvUSD
      '0xC5Cd9f6A1Fb88bed782f475F72fF686ED35b7e8e': DEFAULT_ALERT,
    },
    [Chain.Sonic]: {
      // one-way-market-3 - scETH/crvUSD
      '0x7547E577B3DDC23c02E10792457f8e51a225692E': DEFAULT_ALERT,
      // one-way-market-0 - wS/crvUSD
      '0x5eD490a9B71fa797231d2c5D9bE25bf91a953C19': DEFAULT_ALERT,
    },
  },

  /** MINT MARKET ALERTS */
  Mint: {},
}

export type DeprecatedMarketAlert = { message: string; url?: string }

// Deprecated markets are hidden from market list for new users but remain accessible to users with existing positions.
export const DEPRECATED_LLAMAS: Record<
  LlamaMarketType,
  PartialRecord<ApiChain, Record<Address, DeprecatedMarketAlert>>
> = {
  /** DEPRECATED LEND MARKET */
  Lend: {
    ethereum: {
      // swBTC-crvUSD
      '0x276B8C8873079eEACCF4Dd241De14be92D733b45': {
        message: t`This market is empty (it's never been used) and the oracle cannot be trusted.`,
      },
      // wstUSR-crvUSD
      '0x89707721927d7aaeeee513797A8d6cBbD0e08f41': DEFAULT_DEPRECATE,
      // sDOLA-crvUSD 2024-07-17
      '0xCf3DF6C1B4A6b38496661B31170de9508b867C8E': DEFAULT_DEPRECATE,
      // sDOLA-crvUSD
      '0xaD444663c6C92B497225c6cE65feE2E7F78BFb86': {
        message: t`This market is deprecated after donation attack.`,
      },
      // crvUSD-WETH old
      '0xa5D9137d2A1Ee912469d911A8E74B6c77503bac8': DEFAULT_DEPRECATE,
      // crvUSD-tBTC old
      '0xe438658874b0acf4D81c24172E137F0eE00621b8': DEFAULT_DEPRECATE,
      // USD0USD0++-crvUSD old
      '0xDC8b1Caf2e10dE76fb67E82C2485E7d4fA098C53': DEFAULT_DEPRECATE,
      // ynETH-crvUSD
      '0xdC5D5EE1223D4C8b7eAc8e876793f2171e7e8dEb': DEFAULT_DEPRECATE,
      // crvUSD-ynETH
      '0x757C61d89bD0406BfcBB68178BBfaE79ECa46c0f': DEFAULT_DEPRECATE,
      // LBTC-crvUSD
      '0xC28C2FD809FC1795f90de1C9dA2131434A77721d': DEFAULT_DEPRECATE,
      // sUSDf-crvUSD
      '0xD961B0Da2B0Fb04439c96B552777720B5FC551A0': DEFAULT_DEPRECATE,
      // yvUSDC-1-crvUSD
      '0xB62B9272679d7A495d7e9698d8663F217224408a': DEFAULT_DEPRECATE,
      // yvUSDS-1-crvUSD
      '0xE786af7faef857C8D850d648723Eec0A27cd8581': DEFAULT_DEPRECATE,
      // yvWETH-1-crvUSD
      '0x5bfEE37053d711F49A0aCf5afEd6496fA68dCE32': DEFAULT_DEPRECATE,
      // zkBTC-crvUSD
      '0xbe0f8c48776c0433B2b778AE9c076C21683ebe7B': DEFAULT_DEPRECATE,
      // zkBTC-crvUSD (2)
      '0xbCc9AcD2E7934bb8B5d734416737694AcDD9E25a': DEFAULT_DEPRECATE,
      // sdeUSD-crvUSD
      '0xFA4f65B3Dc477738ce8618e9145E1f0Ad9E29034': DEFAULT_DEPRECATE,
      // ezETH-crvUSD
      '0x3c1350aa6FaFF17c87Bde2015BBb45100D37dAD3': DEFAULT_DEPRECATE,
      // CRV-crvUSD
      '0xEdA215b7666936DEd834f76f3fBC6F323295110A': {
        message: t`This market is deprecated, read the governance post to learn more.`,
        url: 'https://gov.curve.finance/t/crv-long-llamalend-market-next-steps/11045',
      },
      // UwU-crvUSD
      '0x09dBDEB3b301A4753589Ac6dF8A178C7716ce16B': DEFAULT_DEPRECATE,
      // UNIT0-crvUSD
      '0xd15d9797c4ECBf1c97c010327602bC51A09Dfb95': DEFAULT_DEPRECATE,
    },
    arbitrum: {
      // iBTC-crvUSD
      '0x3e293dB65c81742e32b74E21A0787d2936beeDf7': { message: t`iBTC is undergoing systematic unwinding` },
      // EYWA-crvUSD
      '0x7a5A1c91dAF5A41942F90b3f8a9c4d3526294c16': DEFAULT_DEPRECATE,
      // FXN-crvUSD
      '0x7Adcc491f0B7f9BC12837B8F5Edf0e580d176F1f': DEFAULT_DEPRECATE,
      // FXN-crvUSD
      '0xAe659CE8f2f23649E09e92D164244AA127A7a2c7': DEFAULT_DEPRECATE,
      // CRV-crvUSD
      '0xF4e35f69D0BeE1AFC26EE73f12Fa7fA220F16F40': DEFAULT_DEPRECATE,
      // IBTC-crvUSD
      '0x991Bf50A34972227e681127D9127a1Dc54f67a3b': DEFAULT_DEPRECATE,
      // tBTC-crvUSD
      '0x4153532Eb32D57a1a08cD024c66E79635aFC8e3a': DEFAULT_DEPRECATE,
      // stXAI-crvUSD
      '0x5A2b666E6f36CB0a17CF03c9feb421855Ca9751D': DEFAULT_DEPRECATE,
      // stXAI-crvUSD
      '0x6c1cD25cC6320f992EDE07F6a6e93810e8855bc2': DEFAULT_DEPRECATE,
      // WBTC-crvUSD old
      '0x28c20590de7539C316191F413686dcF794d8898E': DEFAULT_DEPRECATE,
      // gmUSDC-crvUSD
      '0x4064Ed6Ae070F126F56c47c8a8CdD6B924668b5D': DEFAULT_DEPRECATE,
      // gmUSDC-crvUSD
      '0x5014AB37Fca7201baDEc3C0d0f28Dc7899cdC7D5': DEFAULT_DEPRECATE,
      // stXAI-crvUSD
      '0x398e6dd92Df9F792D0107668871e6F49ebdfE028': DEFAULT_DEPRECATE,
      // ARB-crvUSD old
      '0x76709bC0dA299Ab0234EEC51385E900922AE98f5': DEFAULT_DEPRECATE,
    },
    sonic: {
      // sTS-crvUSD
      '0xB8C93fb97884Ea07c2Eb0eA741f78D10e8C5aF9F': DEFAULT_DEPRECATE,
      // scETH-crvUSD
      '0x7547E577B3DDC23c02E10792457f8e51a225692E': DEFAULT_DEPRECATE,
      // wS-crvUSD
      '0x5eD490a9B71fa797231d2c5D9bE25bf91a953C19': DEFAULT_DEPRECATE,
      // scUSD-crvUSD
      '0xbb7A0C558Fd34234Dc1608f4CD0a334E0075D73a': DEFAULT_DEPRECATE,
      // wOS-crvUSD
      '0xDC06056e208aB92bF173FF6DD662F1018ea0E483': DEFAULT_DEPRECATE,
    },
    optimism: {
      // WBTC-crvUSD
      '0x09cEd8b3392bED73B0358e39AaEC0A6e9b0e76DF': DEFAULT_DEPRECATE,
      // CRV-crvUSD
      '0x88aa928B906b745009B53A31034701Fc377b7C89': DEFAULT_DEPRECATE,
      // wstETH-crvUSD
      '0x6CE5B539367A29d48038A9F3108E6e0f226b83ed': DEFAULT_DEPRECATE,
      // OP-crvUSD
      '0xC5Cd9f6A1Fb88bed782f475F72fF686ED35b7e8e': DEFAULT_DEPRECATE,
      // WETH-crvUSD
      '0x9dba46e6a06FBf24CA11f8912B44338fe1b28Ea9': DEFAULT_DEPRECATE,
    },
    fraxtal: {
      // CRV-crvUSD
      '0x99d5b47D431f1963940F72ffa6F25bC0B9849CbF': DEFAULT_DEPRECATE,
      // SQUID-crvUSD
      '0xBF55Bb9463bBbB6aD724061910a450939E248eA6': DEFAULT_DEPRECATE,
      // WFRAX-crvUSD
      '0xf0922934f16DbE5Df9f90F729b2023D5e1FC2F15': DEFAULT_DEPRECATE,
    },
  },

  /** DEPRECATED MINT MARKET */
  Mint: {
    ethereum: {
      // sfrxETH v1
      '0x8472A9A7632b173c8Cf3a86D3afec50c35548e76': {
        message: t`Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an updated oracle.`,
      },
      // LBTC-crvUSD v1
      '0x8aca5A776a878Ea1F8967e70a23b8563008f58Ef': DEFAULT_DEPRECATE,
    },
  },
}

/**
 * The following markets do not support leverage, but there's no on-chain method
 * to determine this. Therefore, llamalend-js has the following hardcoded logic
 * to filter out those markets:
 *
 * ```typescript
 * private hasLeverage = (): boolean => {
     return this.llamalend.constants.ALIASES.leverage_zap !== this.llamalend.constants.ZERO_ADDRESS &&
       this._getMarketId() >= Number(this.llamalend.constants.ALIASES["leverage_markets_start_id"]);
 * }
 * ```
 *
 * However, we can't use that method in our market list, because we don't have
 * access to a (hydrated) llamalend instance. Therefore, the addresses have been
 * found by invoking the following code in prod, where api is a llamalend instance:
 *
 * ```typescript
 * const marketsWithoutLeverage = api.lendMarkets
 *   .getMarketList()
 *   .map((marketId) => api.getLendMarket(marketId))
 *   .filter((market) => !market.leverage.hasLeverage())
 *   .map((market) => [market.id, market.addresses.controller])
 * ```
 */
export const NO_LEVERAGE_LEND: PartialRecord<ApiChain, Address[]> = {
  ethereum: [
    '0x1E0165DbD2019441aB7927C018701f3138114D71',
    '0xaade9230AA9161880E13a38C83400d3D1995267b',
    '0x413FD2511BAD510947a91f5c6c79EBD8138C29Fc',
    '0xEdA215b7666936DEd834f76f3fBC6F323295110A',
    '0xC510d73Ad34BeDECa8978B6914461aA7b50CF3Fc',
    '0xa5D9137d2A1Ee912469d911A8E74B6c77503bac8',
    '0xe438658874b0acf4D81c24172E137F0eE00621b8',
    '0x98Fc283d6636f6DCFf5a817A00Ac69A3ADd96907',
    '0x09dBDEB3b301A4753589Ac6dF8A178C7716ce16B',
  ],
  arbitrum: [
    '0xB5B6f0E69c283AA32425FA18220e64283B51F0A4',
    '0x013be86e1cdb0f384dAF24Bd974FE75EdFfe6B68',
    '0x28c20590de7539C316191F413686dcF794d8898E',
    '0x5014AB37Fca7201baDEc3C0d0f28Dc7899cdC7D5',
    '0x88f88e937Db48bBfe8E3091718576430704e47Ab',
    '0x76709bC0dA299Ab0234EEC51385E900922AE98f5',
    '0xAe659CE8f2f23649E09e92D164244AA127A7a2c7',
    '0x7Adcc491f0B7f9BC12837B8F5Edf0e580d176F1f',
    '0x4064Ed6Ae070F126F56c47c8a8CdD6B924668b5D',
  ],
}
