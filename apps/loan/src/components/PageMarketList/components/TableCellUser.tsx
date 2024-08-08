import type { ChipProps } from '@/ui/Typography/types'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'

const TableCellUser = ({
  collateralId,
  type,
  ...props
}: ChipProps & { collateralId: string; type: 'health' | 'debt' }) => {
  const userDetails = useStore((state) => state.loans.userDetailsMapper[collateralId])

  const { userHealth, userState } = userDetails ?? {}
  const { debt } = userState ?? {}

  if (typeof userDetails === 'undefined') {
    return '-'
  }

  switch (type) {
    case 'health':
      return (
        <Chip {...props} size="md" tooltip={formatNumber(userHealth, { showAllFractionDigits: true })}>
          {formatNumber(userHealth, { style: 'percent', maximumFractionDigits: 2 })}
        </Chip>
      )
    case 'debt':
      return (
        <Chip {...props} size="md" tooltip={formatNumber(debt)}>
          {formatNumber(debt, { notation: 'compact' })}
        </Chip>
      )
    default:
      return null
  }
}

export default TableCellUser
