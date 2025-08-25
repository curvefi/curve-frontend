import { Box } from '@mui/material'
import { formatNumber } from '@ui/utils/utilsFormat'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from './ActionInfo'

export interface DetailInfoLeverageXProps {
  leverage: string | undefined
  maxLeverage: string | undefined
  loading: boolean
}

const DetailInfoLeverageX = ({ leverage, maxLeverage, loading }: DetailInfoLeverageXProps) => {
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const formattedLeverage = formatNumber(leverage, { maximumFractionDigits: 2, defaultValue: '-' })
  const formattedMaxLeverage = formatNumber(maxLeverage, { maximumFractionDigits: 2, defaultValue: '-' })

  const value = loading ? '' : `${formattedLeverage}x`
  const valueRight =
    isAdvancedMode && maxLeverage && !loading ? (
      <Box component="span" sx={{ ml: 1, opacity: 0.7 }}>
        (max {formattedMaxLeverage}x)
      </Box>
    ) : null

  return <ActionInfo label={t`Leverage`} value={value} valueRight={valueRight} loading={loading} />
}

export default DetailInfoLeverageX
