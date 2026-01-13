import { Fragment } from 'react'
import { RewardsApy } from '@/dex/types/main.types'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'

type Prop = {
  isHighlight: boolean
  rewardsApy: RewardsApy | undefined
}

export const TableCellRewardsOthers = ({ isHighlight, rewardsApy }: Prop) => {
  if (!rewardsApy?.other || rewardsApy.other.length === 0) {
    return null
  }

  return (
    <div>
      {rewardsApy?.other?.map((o) => (
        <Fragment key={o.tokenAddress}>
          <Chip size="md" isBold={isHighlight}>
            {formatNumber(o.apy, FORMAT_OPTIONS.PERCENT)} {o.symbol}
          </Chip>
          <br />
        </Fragment>
      ))}
    </div>
  )
}
