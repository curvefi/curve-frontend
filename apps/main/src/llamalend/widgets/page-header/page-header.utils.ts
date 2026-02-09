import { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

export const generateSubtitle = (
  collateralSymbol: string | undefined,
  borrowedSymbol: string | undefined,
  type: LlamaMarketType,
) => {
  if (!collateralSymbol || !borrowedSymbol) return undefined
  return type === LlamaMarketType.Mint
    ? t`Use ${collateralSymbol} to borrow and mint ${borrowedSymbol}`
    : t`Use ${collateralSymbol} to borrow ${borrowedSymbol}`
}

export const generateMarketTitle = (collateralSymbol: string | undefined, borrowedSymbol: string | undefined) => {
  if (!collateralSymbol || !borrowedSymbol) return t`Market`
  return `${collateralSymbol.toUpperCase()}•${borrowedSymbol.toUpperCase()}`
}

export const extractPropsFromMarket = (market: LlamaMarketTemplate | undefined) => {
  if (!market) return { collateral: undefined, borrowed: undefined }

  if (market instanceof MintMarketTemplate) {
    return {
      collateral: { symbol: market.coins[1], address: market.coinAddresses[1] },
      borrowed: { symbol: market.coins[0], address: market.coinAddresses[0] },
    }
  }

  return {
    collateral: { symbol: market.collateral_token.symbol, address: market.collateral_token.address },
    borrowed: { symbol: market.borrowed_token.symbol, address: market.borrowed_token.address },
  }
}
