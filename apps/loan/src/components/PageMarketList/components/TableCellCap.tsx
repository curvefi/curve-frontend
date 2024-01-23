import isUndefined from 'lodash/isUndefined'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

type Props = {
  cap: string | undefined
}

const TableCellCap = ({ cap }: Props) => {
  return (
    <>
      {isUndefined(cap) ? (
        ''
      ) : (
        <Chip size="md" tooltip={formatNumber(cap)}>
          {formatNumber(cap, { notation: 'compact' })}
        </Chip>
      )}
    </>
  )
}

export default TableCellCap
