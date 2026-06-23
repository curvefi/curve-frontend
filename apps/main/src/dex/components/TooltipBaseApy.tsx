import type { PoolListItem } from '@/dex/features/pool-list/poolList.types'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type TooltipBaseApyProps = {
  baseDailyApy: PoolListItem['baseDailyApy']
  baseWeeklyApy: PoolListItem['baseWeeklyApy']
}

export const TooltipBaseApy = ({ baseDailyApy, baseWeeklyApy }: TooltipBaseApyProps) => (
  <Box>
    <Typography component="p" variant="bodySBold" sx={{ marginBottom: Spacing.xs, whiteSpace: 'nowrap' }}>
      {t`Pool APY`}{' '}
      <Typography component="span" variant="bodyXsRegular" color="textTertiary">
        {t`(annualized)`}
      </Typography>
    </Typography>
    <Box component="ul" sx={{ margin: 0, paddingInlineStart: Spacing.md }}>
      <Typography component="li" variant="bodySRegular">
        {t`Daily`}: {formatNumber(baseDailyApy, 'percent.value')}
      </Typography>
      <Typography component="li" variant="bodySRegular">
        {t`Weekly`}: {formatNumber(baseWeeklyApy, 'percent.value')}
      </Typography>
    </Box>

    {baseDailyApy != null && baseDailyApy < 0 && (
      <Typography component="p" variant="bodySRegular" color="warning" sx={{ marginTop: Spacing.sm }}>
        {t`Base vAPY can temporarily be negative when A parameter is ramped down, or crypto pools spend profit to rebalance.`}
      </Typography>
    )}
  </Box>
)
