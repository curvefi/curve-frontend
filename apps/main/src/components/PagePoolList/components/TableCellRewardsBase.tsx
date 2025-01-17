import React from 'react'

import { LARGE_APY } from '@/constants'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import ChipVolatileBaseApy from '@/components/PagePoolList/components/ChipVolatileBaseApy'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TooltipBaseApy from '@/components/PagePoolList/components/TooltipBaseApy'
import { RewardBase, PoolData, PoolDataCache } from '@/types/main.types'

type Props = {
  base: RewardBase | undefined
  isHighlight: boolean
  poolData: (PoolData | PoolDataCache) | undefined
}

const TableCellRewardsBase = ({ base, isHighlight, poolData }: Props) => {
  const failedFetching24hOldVprice =
    poolData && 'failedFetching24hOldVprice' in poolData && poolData.failedFetching24hOldVprice

  return (
    <>
      {failedFetching24hOldVprice ? (
        <span>
          -<IconTooltip>Not available currently</IconTooltip>
        </span>
      ) : (
        typeof base !== 'undefined' && (
          <>
            {+base.day > LARGE_APY ? (
              <ChipVolatileBaseApy isBold={isHighlight} />
            ) : (
              <Chip
                isBold={isHighlight}
                size="md"
                tooltip={!!base ? <TooltipBaseApy poolData={poolData} baseApy={base} /> : null}
                tooltipProps={{
                  placement: 'bottom end',
                  textAlign: 'left',
                  ...(base && Number(base.day) < 0 ? { minWidth: '200px' } : {}),
                }}
              >
                {formatNumber(base.day, FORMAT_OPTIONS.PERCENT)}
              </Chip>
            )}
          </>
        )
      )}
    </>
  )
}

export default TableCellRewardsBase
