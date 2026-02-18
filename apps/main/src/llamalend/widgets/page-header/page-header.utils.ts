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
  return `${collateralSymbol.toUpperCase()} • ${borrowedSymbol.toUpperCase()}`
}
