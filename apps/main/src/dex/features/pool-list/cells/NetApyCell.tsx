import { styled } from 'styled-components'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Chip } from '@ui/Typography/Chip'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import type { PoolRow } from '../types'
import { NetApyTooltipContent } from './NetApyTooltipContent'
import { RewardIcons } from './RewardIcons'
import { formatCellValue, getBaseApy, getNetApy, isVolatileApy } from './utils'

const { Spacing } = SizesAndSpaces

const TooltipFreeVolatileNetApyChip = styled(Chip)`
  color: var(--danger-400);
`

const VOLATILE_NET_APY_LABEL = `${formatNumber(5000, { abbreviate: false })}+%`

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
              <TooltipFreeVolatileNetApyChip size="md" isBold>
                {VOLATILE_NET_APY_LABEL}
              </TooltipFreeVolatileNetApyChip>
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
