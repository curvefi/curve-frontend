import { LendingVault } from '@/entities/vaults'
import { formatNumber } from '@/ui/utils'
import { CellContext } from '@tanstack/react-table'

export const LiquidityCell = ({ getValue }: CellContext<LendingVault, LendingVault['totalSupplied']['usdTotal']>) => {
  const value = getValue()
  return value ? formatNumber(value, { currency: 'USD', notation: 'compact' }) : '-'
}
