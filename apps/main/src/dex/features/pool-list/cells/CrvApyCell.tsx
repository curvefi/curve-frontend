import { CrvApyTooltipContent } from '@/dex/components/CrvApyTooltipContent'
import { t } from '@evm-ui/lib/i18n'
import { TokenInfo } from '@evm-ui/shared/ui/TokenInfo'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { MAINNET_CRV } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { PoolRow } from '../types'
import { formatCellValue, getCrvApyRange } from './utils'

export const CrvApyCell = ({ pool }: { pool: PoolRow }) => {
  const range = pool.gauge?.isKilled ? null : getCrvApyRange(pool)

  return (
    <Box data-testid="pool-crv-apy" sx={{ display: 'flex', justifyContent: 'end' }}>
      <WithWrapper
        shouldWrap={range}
        Wrapper={Tooltip}
        clickable
        title={t`CRV APY`}
        body={range && <CrvApyTooltipContent unboostedApy={range.unboostedApy} maximumApy={range.boostedApy} />}
        placement="top"
      >
        <Box data-testid={range && 'pool-crv-apy-tooltip-trigger'}>
          {range ? (
            <TokenInfo
              address={MAINNET_CRV.address}
              blockchainId={MAINNET_CRV.chain}
              iconSize="mui-sm"
              iconPosition="right"
              iconAlignment="start"
              primary={
                <span data-testid="pool-crv-apy-unboosted">{formatCellValue(range.unboostedApy, 'percent.rate')}</span>
              }
              secondary={
                <span data-testid="pool-crv-apy-boosted">{formatCellValue(range.boostedApy, 'percent.rate')}</span>
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
