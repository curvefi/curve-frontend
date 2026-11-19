import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import { Badge } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import type { QueryProp } from '@ui/features/queries/util'
import { LeverageIcon } from '@ui/icons/LeverageIcon'
import { t } from '@ui/lib/i18n'

/** Marks the action card of a position that borrowed through the leverage zap since it was last closed */
export const LeveragedPositionBadge = ({ collateralEvents }: { collateralEvents: QueryProp<UserCollateralEvents> }) =>
  useLlamalendEquityLeverage() &&
  collateralEvents.data?.isZapLeveraged && (
    <Tooltip title={t`Leveraged position`} body={t`This position borrowed through the leverage zap.`}>
      <Badge
        color="active"
        size="medium"
        icon={<LeverageIcon />}
        sx={{ aspectRatio: 1, justifyContent: 'center' }}
        data-testid="leveraged-position-badge"
      />
    </Tooltip>
  )
