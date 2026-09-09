import { DetailText } from '@/dex/components/PageDashboard/components/TableRow'
import type { WalletPoolData } from '@/dex/components/PageDashboard/types'
import { amount } from '@evm-ui/utils'
import { Chip } from '@legacy-ui/Typography'
import { formatNumber } from '@primitives/number.utils'
import { tooltipProps } from '../utils'

type Props = Pick<WalletPoolData, 'liquidityUsd' | 'percentStaked'> & { isHighLight: boolean }

export const TableCellBalances = ({ isHighLight, liquidityUsd, percentStaked }: Props) => (
  <>
    <Chip
      isNumber
      isBold={isHighLight}
      size="md"
      tooltip={formatNumber(amount(liquidityUsd), 'usd.amount')}
      tooltipProps={tooltipProps}
    >
      {formatNumber(amount(liquidityUsd), 'usd.notional')}
    </Chip>
    <div>{percentStaked && <DetailText>{formatNumber(amount(percentStaked), 'percent.value')} staked</DetailText>}</div>
  </>
)
