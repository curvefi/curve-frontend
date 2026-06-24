import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { LARGE_APY } from '@/dex/constants'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { maybe } from '@primitives/objects.utils'
import type { CellContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolListItem } from '../poolList.types'
import { getPoolYieldApy } from '../poolList.utils'

const { Spacing } = SizesAndSpaces

const BaseApyTooltip = ({ baseDailyApr, baseWeeklyApr }: Pick<PoolListItem, 'baseDailyApr' | 'baseWeeklyApr'>) => {
  const baseDailyApy = getPoolYieldApy(baseDailyApr)

  return (
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
          {t`Weekly`}: {formatNumber(getPoolYieldApy(baseWeeklyApr), 'percent.value')}
        </Typography>
      </Box>

      {baseDailyApy != null && baseDailyApy < 0 && (
        <Typography component="p" variant="bodySRegular" color="warning" sx={{ marginTop: Spacing.sm }}>
          {t`Base vAPY can temporarily be negative when A parameter is ramped down, or crypto pools spend profit to rebalance.`}
        </Typography>
      )}
    </Box>
  )
}

export const PoolListBaseApyCell = ({
  row: { original: pool },
  getValue,
}: CellContext<PoolListItem, PoolListItem['baseDailyApr']>) =>
  maybe(getValue(), baseDailyApr => {
    const baseDailyApy = getPoolYieldApy(baseDailyApr)

    return baseDailyApy != null && baseDailyApy > LARGE_APY ? (
      <ChipVolatileBaseApy />
    ) : (
      <Tooltip title={<BaseApyTooltip baseDailyApr={baseDailyApr} baseWeeklyApr={pool.baseWeeklyApr} />}>
        <Typography component="span" variant="tableCellMBold">
          {formatNumber(baseDailyApy, 'percent.rate')}
        </Typography>
      </Tooltip>
    )
  }) ?? (
    <Typography component="span" variant="tableCellMBold">
      {formatNumber(null, 'percent.rate')}
    </Typography>
  )
