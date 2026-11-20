import type { UserBorrowEvents } from '@/llamalend/features/user-position-history/hooks/useUserBorrowEvents'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import { Badge } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import type { QueryProp } from '@ui/features/queries/util'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { LeverageIcon } from '@ui/icons/LeverageIcon'
import { t } from '@ui/lib/i18n'

/** Marks the action card of a position that borrowed through the leverage zap since it was last closed */
export const LeveragedPositionBadge = ({ collateralEvents }: { collateralEvents: QueryProp<UserBorrowEvents> }) => {
  const isMobile = useIsMobile()
  return (
    useLlamalendEquityLeverage() &&
    collateralEvents.data?.isZapLeveraged && (
      <Tooltip title={t`Leveraged position`} body={t`This position borrowed through the leverage zap.`}>
        <Badge
          color="active"
          size={isMobile ? 'small' : 'medium'}
          icon={<LeverageIcon />}
          data-testid="leveraged-position-badge"
        />
      </Tooltip>
    )
  )
}
