import { ChipVolatileBaseApy as ChipVolatileBaseRate } from '@/dex/components/ChipVolatileBaseApy'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
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
import { formatCellValue, getNetRate, isVolatileRate } from './utils'

const { Spacing } = SizesAndSpaces

export const NetRateCell = ({ pool }: { pool: PoolRow }) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const netRate = getNetRate(pool, convertAprToApy)
  const volatile = isVolatileRate(netRate)

  return (
    <Stack sx={{ alignItems: 'flex-end', gap: Spacing.xs }}>
      <WithWrapper
        shouldWrap={netRate}
        Wrapper={Tooltip}
        clickable
        title={rateDisplay === 'apy' ? t`Net APY` : t`Net APR`}
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
              <ChipVolatileBaseRate isBold disableTooltip />
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
