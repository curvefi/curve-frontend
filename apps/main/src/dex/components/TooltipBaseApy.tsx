import type { V2Pool } from '@curvefi/prices-api/pools'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type TooltipBaseApyProps = {
  baseDailyApr: V2Pool['baseDailyApr']
  baseWeeklyApr: V2Pool['baseWeeklyApr']
}

export const TooltipBaseApy = ({ baseDailyApr, baseWeeklyApr }: TooltipBaseApyProps) => (
  <Box>
    <Typography component="p" variant="bodySBold" sx={{ marginBottom: Spacing.xs, whiteSpace: 'nowrap' }}>
      {t`Pool APY`}{' '}
      <Typography component="span" variant="bodyXsRegular" color="textTertiary">
        {t`(annualized)`}
      </Typography>
    </Typography>
    <Box component="ul" sx={{ margin: 0, paddingInlineStart: Spacing.md }}>
      <Typography component="li" variant="bodySRegular">
        {t`Daily`}: {formatNumber(baseDailyApr, 'percent.value')}
      </Typography>
      <Typography component="li" variant="bodySRegular">
        {t`Weekly`}: {formatNumber(baseWeeklyApr, 'percent.value')}
      </Typography>
    </Box>

    {baseDailyApr != null && baseDailyApr < 0 && (
      <Typography component="p" variant="bodySRegular" color="warning" sx={{ marginTop: Spacing.sm }}>
        {t`Base vAPY can temporarily be negative when A parameter is ramped down, or crypto pools spend profit to rebalance.`}
      </Typography>
    )}
  </Box>
)
