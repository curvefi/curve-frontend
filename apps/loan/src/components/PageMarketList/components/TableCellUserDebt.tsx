import type { ChipProps } from '@/ui/Typography/types'

import isUndefined from 'lodash/isUndefined'

import { formatNumber } from '@/ui/utils'

import { Chip } from '@/ui/Typography'

const TableCellUserDebt = ({
  userDebt,
  ...props
}: ChipProps & {
  userDebt: UserLoanDetails['userState']['debt'] | undefined
}) => {
  return isUndefined(userDebt) ? (
    <></>
  ) : (
    <Chip {...props} size="md" tooltip={formatNumber(userDebt)}>
      {formatNumber(userDebt, { notation: 'compact' })}
    </Chip>
  )
}

export default TableCellUserDebt
