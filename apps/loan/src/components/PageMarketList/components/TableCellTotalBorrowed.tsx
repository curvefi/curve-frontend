import isUndefined from 'lodash/isUndefined'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  totalDebt: string | undefined
}

const TableCellTotalBorrowed = ({ totalDebt }: Props) => {
  return (
    <>
      {isUndefined(totalDebt) ? (
        ''
      ) : (
        <Chip
          size="md"
          tooltip={formatNumber(totalDebt, { ...getFractionDigitsOptions(totalDebt, 2) })}
          tooltipProps={{ placement: 'bottom end', minWidth: '300px' }}
        >
          {formatNumber(totalDebt, { notation: 'compact' })}
        </Chip>
      )}
    </>
  )
}

export default TableCellTotalBorrowed
