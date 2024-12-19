import { LendingVaultFromApi } from '@/entities/vaults'

export const UtilizationCell = ({ data }: { data: LendingVaultFromApi }) =>
  (data.borrowed.usdTotal && (100 * data.totalSupplied.usdTotal) / data.borrowed.usdTotal).toFixed(2) + '%'
