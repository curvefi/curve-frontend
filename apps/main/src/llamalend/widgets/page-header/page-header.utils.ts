import { t } from '@ui-kit/lib/i18n'

export const generateSubtitle = (
  collateralSymbol: string | undefined,
  borrowedSymbol: string | undefined,
  type: 'mint' | 'lend',
) => {
  if (!collateralSymbol || !borrowedSymbol) return t`Market Details`
  return type === 'mint'
    ? t`Use ${collateralSymbol} to borrow and mint ${borrowedSymbol}`
    : t`Use ${collateralSymbol} to borrow ${borrowedSymbol}`
}

export const generateMarketTitle = (collateralSymbol: string | undefined, borrowedSymbol: string | undefined) => {
  if (!collateralSymbol || !borrowedSymbol) return t`Market`
  return `${collateralSymbol.toUpperCase()}•${borrowedSymbol.toUpperCase()}`
}
