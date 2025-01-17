import { LendingVault } from '@loan/entities/vaults'
import { formatNumber } from '@ui/utils'
import { CellContext } from '@tanstack/react-table'

export const CompactUsdCell = ({ getValue }: CellContext<LendingVault, number>) => {
  const value = getValue()
  return value ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : '-'
}
