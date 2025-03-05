import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { Chip } from '@ui/Typography'
import { RewardsApy } from '@/dex/types/main.types'
import { Fragment } from 'react'

type Prop = {
  isHighlight: boolean
  rewardsApy: RewardsApy | undefined
}

const TableCellRewardsOthers = ({ isHighlight, rewardsApy }: Prop) => {
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

export default TableCellRewardsOthers
