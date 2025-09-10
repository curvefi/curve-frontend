import type { Address } from 'viem'
import type { NetworkEnum } from '@/llamalend/llamalend.types'
import { LlamaMarketTemplate } from '@/llamalend/widgets/borrow/borrow.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD_ADDRESS } from '@ui-kit/utils'

type MarketAndType =
  | [market: MintMarketTemplate, type: LlamaMarketType.Mint]
  | [market: LendMarketTemplate, type: LlamaMarketType.Lend]

export function getLlamaMarket(id: string): MarketAndType {
  const lib = requireLib('llamaApi')
  const mintMarket = lib.getMintMarket(id)
  if (mintMarket) return [mintMarket, LlamaMarketType.Mint] as const
  const lendMarket = lib.getLendMarket(id)
  if (lendMarket) return [lendMarket, LlamaMarketType.Lend] as const
  throw new Error(`Market with ID ${id} not found`)
}
export const getTokens = (market: LlamaMarketTemplate, chain: NetworkEnum) =>
  market instanceof MintMarketTemplate
    ? {
        collateralToken: {
          chain,
          symbol: market.collateralSymbol,
          address: market.collateral as Address,
          decimals: market.collateralDecimals,
        },
        borrowToken: {
          chain,
          symbol: 'crvUSD',
          address: CRVUSD_ADDRESS,
          decimals: 18,
        },
      }
    : {
        collateralToken: {
          chain,
          symbol: market.collateral_token.symbol,
          address: market.collateral_token.address as Address,
          decimals: market.collateral_token.decimals,
        },
        borrowToken: {
          chain,
          symbol: market.borrowed_token.symbol,
          address: market.borrowed_token.address as Address,
          decimals: market.borrowed_token.decimals,
        },
      }
