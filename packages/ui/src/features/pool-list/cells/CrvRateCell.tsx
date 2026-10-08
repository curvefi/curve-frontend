import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { TokenInfo } from '@ui/components/TokenInfo'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { t } from '@ui/lib/i18n'
import { CrvRateTooltipContent } from '../../pools/CrvRateTooltipContent'
import type { PoolRow, PoolTableMeta } from '../types'
import { formatCellValue, getCrvAprRange } from './utils'

export const CrvRateCell = ({ pool, crvToken }: { pool: PoolRow; crvToken: PoolTableMeta['crvToken'] }) => {
  const range = pool.gauge?.isKilled ? null : getCrvAprRange(pool)

  return (
    <Box data-testid="pool-crv-rate" sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        clickable
        title={t`CRV APR`}
        body={
          range && (
            <CrvRateTooltipContent
              crvToken={crvToken}
              unboostedRate={range.unboostedRate}
              maximumRate={range.boostedRate}
            />
          )
        }
        placement="top"
      >
        <Box data-testid={range && 'pool-crv-rate-tooltip-trigger'}>
          {range ? (
            <TokenInfo
              {...crvToken}
              iconSize="mui-sm"
              iconPosition="right"
              iconAlignment="start"
              primary={
                <span data-testid="pool-crv-rate-unboosted">
                  {formatCellValue(range.unboostedRate, 'percent.rate')}
                </span>
              }
              secondary={
                <span data-testid="pool-crv-rate-boosted">{formatCellValue(range.boostedRate, 'percent.rate')}</span>
              }
              sx={{ justifyContent: 'end' }}
            />
          ) : (
            <Typography variant="tableCellValue">{formatCellValue(null, 'percent.rate')}</Typography>
          )}
        </Box>
      </WithWrapper>
    </Box>
  )
}
