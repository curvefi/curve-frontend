import React from 'react'

import { LARGE_APY } from '@/constants'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'
import IconTooltip from '@/ui/IconTooltip'
import TooltipBaseApy from '@/components/PagePoolList/components/TooltipBaseApy'

type Props = {
  base: RewardBase | undefined
  isHighlight: boolean
  poolData: (PoolData | PoolDataCache) | undefined
}

const TableCellRewardsBase = ({ base, isHighlight, poolData }: Props) => {
  let baseFormatted = ''
  if (base?.day) {
    if (+base.day > LARGE_APY) {
      baseFormatted = `${formatNumber(LARGE_APY)}+%`
    } else {
      baseFormatted = `${formatNumber(base.day, FORMAT_OPTIONS.PERCENT)}`
    }
  }

  const failedFetching24hOldVprice =
    poolData && 'failedFetching24hOldVprice' in poolData && poolData.failedFetching24hOldVprice

  return failedFetching24hOldVprice ? (
    <span>
      -<IconTooltip>Not available currently</IconTooltip>
    </span>
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
      {baseFormatted}
    </Chip>
  )
}

export default TableCellRewardsBase
