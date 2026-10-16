import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@primitives/number.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { mapQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import type { LiquidityDetailsData } from './types'

const { Spacing } = SizesAndSpaces

export const MarketParticipationCard = ({
  marketParticipation: { stakedBalance, stakedPercent, unstakedBalance, unstakedPercent, userLpShare },
}: {
  marketParticipation: LiquidityDetailsData['marketParticipation']
}) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Market Participation`} />
    <CardContent component={Stack} sx={{ gap: Spacing.xs, marginBlockStart: Spacing.xs }}>
      <ActionInfo
        label={t`Your share of pool`}
        value={mapQuery(userLpShare, data => formatNumber(amount(data), 'percent.value'))}
      />
      {stakedBalance && (
        <ActionInfo
          label={t`LP tokens staked`}
          value={mapQuery(stakedBalance, balance => formatNumber(amount(balance), 'token.balance'))}
          valueRight={stakedPercent && mapQuery(stakedPercent, value => `(${formatNumber(value, 'percent.value')})`)}
        />
      )}
      {unstakedBalance && (
        <ActionInfo
          label={t`LP tokens unstaked`}
          value={mapQuery(unstakedBalance, balance => formatNumber(amount(balance), 'token.balance'))}
          valueRight={
            unstakedPercent && mapQuery(unstakedPercent, value => `(${formatNumber(value, 'percent.value')})`)
          }
        />
      )}
    </CardContent>
  </Card>
)
