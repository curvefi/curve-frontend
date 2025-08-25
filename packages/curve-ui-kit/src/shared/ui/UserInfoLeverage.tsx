import { formatNumber } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from './ActionInfo'

export interface UserInfoLeverageProps {
  currentLeverage: string | undefined
  loading: boolean
}

const UserInfoLeverage = ({ currentLeverage, loading }: UserInfoLeverageProps) => {
  const formattedLeverage = formatNumber(currentLeverage, { maximumFractionDigits: 2, defaultValue: '-' })
  const value = loading ? '' : `${formattedLeverage}x`

  return <ActionInfo label={t`Current Leverage`} value={value} loading={loading} />
}

export default UserInfoLeverage
