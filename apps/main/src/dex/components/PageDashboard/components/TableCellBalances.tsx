import { DetailText } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData } from '@/dex/components/PageDashboard/types'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { tooltipProps } from '../utils'

type Props = Pick<WalletPoolData, 'liquidityUsd' | 'percentStaked'> & {
  isHighLight: boolean
}

export const TableCellBalances = ({ isHighLight, liquidityUsd, percentStaked }: Props) => (
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
      {percentStaked && <DetailText>{formatNumber(percentStaked, { ...FORMAT_OPTIONS.PERCENT })} staked</DetailText>}
    </div>
  </>
)
