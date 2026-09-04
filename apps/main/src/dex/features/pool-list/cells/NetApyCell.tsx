import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import type { PoolRow } from '../types'
import { NetApyTooltipContent } from './NetApyTooltipContent'
import { RewardIcons } from './RewardIcons'
import { formatCellValue, getNetApy, isVolatileApy } from './utils'

const { Spacing } = SizesAndSpaces

export const NetApyCell = ({ pool }: { pool: PoolRow }) => {
  const netApy = getNetApy(pool)
  const volatile = isVolatileApy(netApy)

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={netApy}
        Wrapper={Tooltip}
        clickable
        title={t`Net APY`}
        body={<NetApyTooltipContent pool={pool} volatile={volatile} />}
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
