import type { HealthMode } from '@/llamalend/llamalend.types'
import { Icon } from '@ui/Icon'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { getIsUserCloseToLiquidation } from './llama.utils'

export const DEFAULT_BORROW_TOKEN_SYMBOL = 'crvUSD' as const

// 1. If health(full=true) < loan_discount, user is at risk to go from healthy mode to soft liquidation mode (green —> orange).
// 2. If health(full=false) < liquidation_discount , user is at risk to go from soft liquidation mode to hard liquidation mode (orange —> red).
export function getHealthMode(
  borrowedTokenSymbol: string | undefined = '',
  oraclePriceBand: number | null,
  amount: string,
  bands: [number, number] | number[],
  formType: 'create-loan' | 'collateral-decrease' | '',
  healthFull: string,
  healthNotFull: string,
  currColorKey: string,
  newColorKey: string,
) {
  const health = +healthNotFull < 0 ? healthNotFull : healthFull

  let healthMode: HealthMode = {
    percent: health,
    colorKey: 'healthy',
    icon: <Icon name="FavoriteFilled" size={20} />,
    message: null,
    warningTitle: '',
    warning: '',
  }

  if (getIsUserCloseToLiquidation(bands?.[0], null, oraclePriceBand)) {
    let message = ''

    if (newColorKey === 'close_to_liquidation') {
      if (currColorKey === newColorKey || currColorKey === 'soft_liquidation') {
        message = t`You are still close to soft liquidation.`
      } else if (newColorKey === 'close_to_liquidation') {
        const formattedAmount = formatNumber(amount)
        if (formType === 'collateral-decrease') {
          message = t`Removing ${formattedAmount} collateral, will put you close to soft liquidation.`
        } else if (formType === 'create-loan') {
          message = t`Borrowing ${formattedAmount} ${borrowedTokenSymbol} will put you close to soft liquidation.`
        } else {
          message = t`Increasing your borrowed amount by ${formattedAmount} ${borrowedTokenSymbol} will put you close to soft liquidation.`
        }
      }
    }

    healthMode = {
      percent: health,
      colorKey: 'close_to_liquidation',
      icon: <Icon name="FavoriteHalf" size={20} />,
      message,
      warningTitle: t`Close to liquidation range!`,
      warning: message,
    }
  }

  return healthMode
}
