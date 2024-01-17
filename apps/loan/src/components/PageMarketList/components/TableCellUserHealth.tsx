import type { ChipProps } from '@/ui/Typography/types'

import isUndefined from 'lodash/isUndefined'

import { formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

const TableCellUserHealth = ({
  userHealth,
  ...props
}: ChipProps & {
  userHealth: UserLoanDetails['healthNotFull'] | undefined
}) => {
  return isUndefined(userHealth) ? (
    <></>
  ) : (
    <Chip {...props} size="md" tooltip={formatNumber(userHealth, { showAllFractionDigits: true })}>
      {formatNumber(userHealth, { style: 'percent', maximumFractionDigits: 2 })}
    </Chip>
  )
}

export default TableCellUserHealth
