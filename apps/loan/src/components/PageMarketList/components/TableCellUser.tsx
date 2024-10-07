import { Chip } from '@/ui/Typography'
import type { ChipProps } from '@/ui/Typography/types'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'


const TableCellUser = ({
  collateralId,
  type,
  ...props
}: ChipProps & { collateralId: string; type: 'health' | 'debt' }) => {
  const userDetails = useStore((state) => state.loans.userDetailsMapper[collateralId])

  const { userHealth, userState } = userDetails ?? {}
  const { debt } = userState ?? {}

  if (typeof userDetails === 'undefined') {
    return null
  }

  if (type === 'health') {
    return (
      <Chip {...props} size="md" tooltip={formatNumber(userHealth, { showAllFractionDigits: true })}>
        {formatNumber(userHealth, { style: 'percent', maximumFractionDigits: 2 })}
      </Chip>
    )
  }

  if (type === 'debt') {
    return (
      <Chip {...props} size="md" tooltip={formatNumber(debt)}>
        {formatNumber(debt, { notation: 'compact' })}
      </Chip>
    )
  }

  return null
}

export default TableCellUser
