import { ChipVolatileBaseApy } from '@/dex/components/ChipVolatileBaseApy'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { PoolRow } from '../types'
import { NetApyTooltipContent } from './NetApyTooltipContent'
import { RewardIcons } from './RewardIcons'
import { formatCellValue, getBaseApy, getNetApy, isVolatileApy } from './utils'

const { Spacing } = SizesAndSpaces

export const NetApyCell = ({ pool }: { pool: PoolRow }) => {
  const netApy = getNetApy(pool)
  const volatile = isVolatileApy(getBaseApy(pool, 'daily'))

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
