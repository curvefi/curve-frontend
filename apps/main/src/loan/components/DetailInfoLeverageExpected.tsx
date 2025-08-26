import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'

export interface DetailInfoLeverageExpectedProps {
  loading: boolean
  total: string | undefined
  swapToSymbol: string
}

const DetailInfoLeverageExpected = ({ loading, total, swapToSymbol }: DetailInfoLeverageExpectedProps) => {
  const formattedTotal = formatNumber(total, { defaultValue: '-' })
  const value = loading ? '' : `${formattedTotal} ${swapToSymbol}`

  return <ActionInfo label={t`Expected collateral`} value={value} loading={loading} />
}

export default DetailInfoLeverageExpected
