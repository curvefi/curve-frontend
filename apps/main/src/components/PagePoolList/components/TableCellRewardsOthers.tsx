import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

type Prop = {
  isHighlight: boolean
  rewardsApy: RewardsApy | undefined
}

const TableCellRewardsOthers = ({ isHighlight, rewardsApy }: Prop) => {
  return (
    <div>
      {rewardsApy?.other?.map((o) => {
        return (
          <React.Fragment key={o.tokenAddress}>
            <Chip size="md" isBold={isHighlight}>
              {formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} {o.symbol}
            </Chip>
            <br />
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default TableCellRewardsOthers
