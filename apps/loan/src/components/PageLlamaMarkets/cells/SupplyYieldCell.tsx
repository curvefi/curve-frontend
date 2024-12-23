import { LendingVault } from '@/entities/vaults'
import { CellContext } from '@tanstack/react-table'

export const SupplyYieldCell = ({ getValue }: CellContext<LendingVault, LendingVault['rates']['lendApyPcent']>) => {
  const value = getValue()
  return value ? value.toPrecision(4) + '%' : '-'
}
