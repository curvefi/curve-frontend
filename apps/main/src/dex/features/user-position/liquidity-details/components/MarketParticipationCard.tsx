import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { amount, formatNumber } from '@ui-kit/utils'
import type { LiquidityDetailsData } from '../hooks/useLiquidityDetails'

const { Spacing } = SizesAndSpaces

export const MarketParticipationCard = ({
  marketParticipation: { stakedBalance, stakedPercent, unstakedBalance, unstakedPercent, userLpShare },
}: {
  marketParticipation: LiquidityDetailsData['marketParticipation']
}) => (
  <Card size="inline">
    <CardHeader title={t`Market Participation`} />
    <CardContent component={Stack} sx={{ gap: Spacing.xs, marginBlockStart: Spacing.xs }}>
      <ActionInfo
        label={t`Your share of pool`}
        value={mapQuery(userLpShare, data => formatNumber(amount(data), 'percent.value'))}
      />
      <ActionInfo
        label={t`LP tokens staked`}
        value={mapQuery(stakedBalance, balance => formatNumber(amount(balance), 'token.balance'))}
        valueRight={maybe(stakedPercent.data, value => `(${formatNumber(value, 'percent.value')})`)}
      />
      <ActionInfo
        label={t`LP tokens unstaked`}
        value={mapQuery(unstakedBalance, balance => formatNumber(amount(balance), 'token.balance'))}
        valueRight={maybe(unstakedPercent.data, value => `(${formatNumber(value, 'percent.value')})`)}
      />
    </CardContent>
  </Card>
)
