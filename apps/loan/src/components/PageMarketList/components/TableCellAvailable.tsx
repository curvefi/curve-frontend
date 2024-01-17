import isUndefined from 'lodash/isUndefined'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  available: string | undefined
}

const TableCellAvailable = ({ available }: Props) => {
  return (
    <>
      {isUndefined(available) ? (
        ''
      ) : (
        <Chip
          size="md"
          tooltip={formatNumber(available, { ...getFractionDigitsOptions(available, 2) })}
          tooltipProps={{ placement: 'bottom end', minWidth: '300px' }}
        >
          {formatNumber(available, { notation: 'compact' })}
        </Chip>
      )}
    </>
  )
}

export default TableCellAvailable
