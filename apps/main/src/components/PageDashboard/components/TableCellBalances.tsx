import type { WalletPoolData } from '@main/components/PageDashboard/types'

import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { tooltipProps } from '@main/components/PageDashboard/components/Summary'

import { Chip } from '@ui/Typography'
import { DetailText } from '@main/components/PageDashboard/components/TableRow'

type Props = Pick<WalletPoolData, 'liquidityUsd' | 'percentStaked'> & {
  isHighLight: boolean
}

const TableCellBalances: React.FC<Props> = ({ isHighLight, liquidityUsd, percentStaked }) => (
  <>
    <Chip
      isNumber
      isBold={isHighLight}
      size="md"
      tooltip={formatNumber(liquidityUsd, FORMAT_OPTIONS.USD)}
      tooltipProps={tooltipProps}
    >
      {formatNumber(liquidityUsd, { currency: 'USD', notation: 'compact' })}
    </Chip>
    <div>
      {percentStaked && (
        <DetailText>
          {formatNumber(percentStaked, { ...FORMAT_OPTIONS.PERCENT, trailingZeroDisplay: 'stripIfInteger' })} staked
        </DetailText>
      )}
    </div>
  </>
)

export default TableCellBalances
