import useStore from '@/loan/store/useStore'
import { formatNumber } from '@ui/utils'

type Props = {
  collateralId: string
  type: 'available' | 'borrowed' | 'cap'
}

const TableCellUtilization = ({ collateralId, type }: Props) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[collateralId])

  const { capAndAvailable, totalDebt } = loanDetails ?? {}
  const { cap = '', available = '' } = capAndAvailable ?? {}

  if (typeof loanDetails === 'undefined') {
    return ''
  }

  switch (type) {
    case 'available':
      return formatNumber(available, { notation: 'compact' })
    case 'borrowed':
      return formatNumber(totalDebt, { notation: 'compact' })
    case 'cap':
      return formatNumber(cap, { notation: 'compact' })
    default:
      return null
  }
}

export default TableCellUtilization
