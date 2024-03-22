import type { ChipProps } from '@/ui/Typography/types'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'

const TableCellMarketsTotalDebt = ({ type, ...props }: ChipProps & { type: 'debt-fraction' | 'peg-keeper-debt' }) => {
  const totalSupplyResp = useStore((state) => state.crvusdTotalSupply)

  const { total, minted, pegKeepersDebt, error } = totalSupplyResp ?? {}

  return (
    <>
      {error ? (
        '?'
      ) : type === 'debt-fraction' ? (
        +total > 0 && +minted > 0 ? (
          <Chip {...props}>{formatNumber(((+total - +minted) / +total) * 100, FORMAT_OPTIONS.PERCENT)}</Chip>
        ) : (
          '-'
        )
      ) : type === 'peg-keeper-debt' ? (
        <Chip {...props}>{formatNumber(pegKeepersDebt, { defaultValue: '-' })}</Chip>
      ) : null}
    </>
  )
}

export default TableCellMarketsTotalDebt
