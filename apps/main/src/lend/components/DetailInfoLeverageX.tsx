import { DetailInfo } from '@ui/DetailInfo'
import { formatNumber } from '@ui/utils'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoLeverageX = ({
  leverage,
  maxLeverage,
  loading,
}: {
  leverage: string | undefined
  maxLeverage: string | undefined
  loading: boolean
}) => {
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  return (
    <DetailInfo label={t`Leverage:`} loading={loading} loadingSkeleton={[50, 20]}>
      <strong>{formatNumber(leverage, { maximumFractionDigits: 2, defaultValue: '-' })}x</strong>
      {isAdvancedMode && (
        <span> (max {formatNumber(maxLeverage, { maximumFractionDigits: 2, defaultValue: '-' })}x)</span>
      )}
    </DetailInfo>
  )
}
