import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import { t } from '@evm-ui/lib/i18n'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { PoolRow } from '../types'
import { NetRateTooltipContent } from './NetRateTooltipContent'
import { RewardIcons } from './RewardIcons'
import { formatCellValue, getNetApy, isVolatileRate } from './utils'

const { Spacing } = SizesAndSpaces

export const NetRateCell = ({ pool }: { pool: PoolRow }) => {
  const netApy = getNetApy(pool)
  const volatile = isVolatileRate(netApy)

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={netApy}
        Wrapper={Tooltip}
        clickable
        title={t`Net APY`}
        body={<NetRateTooltipContent pool={pool} volatile={volatile} />}
        placement="top"
      >
        <Box
          component="span"
          data-testid={netApy ? 'pool-net-apy-tooltip-trigger' : undefined}
          sx={{ display: 'inline-flex' }}
        >
          {volatile ? (
            <Box component="span" data-testid="pool-net-apy" sx={{ textAlign: 'end' }}>
              <ChipVolatileBaseApy isBold disableTooltip />
            </Box>
          ) : (
            <Typography
              component="span"
              data-testid="pool-net-apy"
              variant="tableCellMBold"
              sx={{ display: 'block', textAlign: 'end' }}
            >
              {formatCellValue(netApy, 'percent.rate')}
            </Typography>
          )}
        </Box>
      </WithWrapper>
      <RewardIcons pool={pool} includeCrv includePoints />
    </Stack>
  )
}
