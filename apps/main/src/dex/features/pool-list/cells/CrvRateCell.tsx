import { CrvRateTooltipContent } from '@/dex/components/CrvRateTooltipContent'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { MAINNET_CRV } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { PoolRow } from '../types'
import { formatCellValue, getCrvRateRange } from './utils'

export const CrvRateCell = ({ pool }: { pool: PoolRow }) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const range = pool.gauge?.isKilled ? null : getCrvRateRange(pool, convertAprToApy)

  return (
    <Box data-testid="pool-crv-rate" sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        clickable
        title={rateDisplay === 'apy' ? t`CRV APY` : t`CRV APR`}
        body={
          range && (
            <CrvRateTooltipContent unboostedRate={range.unboostedRate} maximumRate={range.boostedRate} />
          )
        }
        placement="top"
      >
        <Box data-testid={range && 'pool-crv-rate-tooltip-trigger'}>
          {range ? (
            <TokenInfo
              address={MAINNET_CRV.address}
              blockchainId={MAINNET_CRV.chain}
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
              boldPrimary
              sx={{ justifyContent: 'end' }}
            />
          ) : (
            <Typography variant="tableCellMBold">{formatCellValue(null, 'percent.rate')}</Typography>
          )}
        </Box>
      </WithWrapper>
    </Box>
  )
}
