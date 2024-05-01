import React from 'react'
import { t } from '@lingui/macro'

import { LARGE_APY } from '@/constants'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import ChipVolatileBaseApy from '@/components/PagePoolList/components/ChipVolatileBaseApy'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TooltipBaseApy from '@/components/PagePoolList/components/TooltipBaseApy'

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
                  noWrap: true,
                  placement: 'bottom end',
                  textAlign: 'left',
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
