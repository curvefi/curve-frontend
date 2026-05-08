import { DetailText } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData } from '@/dex/components/PageDashboard/types'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS } from '@ui/utils'
import { formatNumber, amount } from '@ui-kit/utils'
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
      tooltip={formatNumber(amount(liquidityUsd), FORMAT_OPTIONS.USD) ?? '-'}
      tooltipProps={tooltipProps}
    >
      {formatNumber(amount(liquidityUsd), { unit: 'dollar', abbreviate: true }) ?? '-'}
    </Chip>
    <div>
      {percentStaked && (
        <DetailText>
          {formatNumber(amount(percentStaked), { ...FORMAT_OPTIONS.PERCENT, abbreviate: false }) ?? '-'} staked
        </DetailText>
      )}
    </div>
  </>
)
