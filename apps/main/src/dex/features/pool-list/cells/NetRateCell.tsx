import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'
import { NetRateTooltipContent } from './NetRateTooltipContent'
import { RewardIcons } from './RewardIcons'
import { formatCellValue, getNetApr, isVolatileRate } from './utils'

const { Spacing } = SizesAndSpaces

export const NetRateCell = ({ pool }: { pool: PoolRow }) => {
  const netRate = getNetApr(pool)
  const volatile = isVolatileRate(netRate)

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={netRate}
        Wrapper={Tooltip}
        clickable
        title={t`Net APR`}
        body={<NetRateTooltipContent pool={pool} volatile={volatile} />}
        placement="top"
      >
        <Box
          component="span"
          data-testid={netRate ? 'pool-net-rate-tooltip-trigger' : undefined}
          sx={{ display: 'inline-flex' }}
        >
          {volatile ? (
            <Box component="span" data-testid="pool-net-rate" sx={{ textAlign: 'end' }}>
              <ChipVolatileBaseApy isBold disableTooltip />
            </Box>
          ) : (
            <Typography
              component="span"
              data-testid="pool-net-rate"
              variant="tableCellMBold"
              sx={{ display: 'block', textAlign: 'end' }}
            >
              {formatCellValue(netRate, 'percent.rate')}
            </Typography>
          )}
        </Box>
      </WithWrapper>
      <RewardIcons pool={pool} includeCrv includePoints />
    </Stack>
  )
}
