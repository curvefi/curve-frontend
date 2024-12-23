import { LendingVault } from '@/entities/vaults'
import { CellContext } from '@tanstack/react-table'

export const UtilizationCell = ({ getValue }: CellContext<LendingVault, LendingVault['utilizationPercent']>) => {
  const value = getValue()
  return value ? value.toFixed(2) + '%' : '-'
}
