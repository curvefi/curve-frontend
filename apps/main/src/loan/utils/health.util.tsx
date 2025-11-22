import { formatNumber } from 'ui/src/utils/utilsFormat'
import { getIsUserCloseToLiquidation } from '@/llamalend/llama.utils'
import { HealthMode } from '@/loan/types/loan.types'
import Icon from '@ui/Icon/Icon'
import { t } from '@ui-kit/lib/i18n'

export function getHealthMode(
  oraclePriceBand: number | null,
  amount: string,
  bands: [number, number] | number[],
  formType: 'create-loan' | 'collateral-decrease' | '',
  healthFull: string,
  healthNotFull: string,
  isNew: boolean,
  currColorKey: string,
  newColorKey: string,
) {
  let healthMode: HealthMode = {
    percent: healthFull,
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
          message = t`Borrowing ${formattedAmount} will put you close to soft liquidation.`
        } else {
          message = t`Increasing your borrowed amount by ${formattedAmount} will put you close to soft liquidation.`
        }
      }
    }

    healthMode = {
      percent: +healthNotFull < 0 ? healthNotFull : healthFull,
      colorKey: 'close_to_liquidation',
      icon: <Icon name="FavoriteHalf" size={20} />,
      message,
      warningTitle: t`Close to liquidation range!`,
      warning: message,
    }
  }

  return healthMode
}
