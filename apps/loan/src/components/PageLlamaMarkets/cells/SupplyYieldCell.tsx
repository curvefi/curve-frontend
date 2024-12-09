import { LendingVaultFromApi } from '@/entities/vaults'

export const SupplyYieldCell = ({ data }: { data: LendingVaultFromApi }) =>
  (data.rates.lendApyPcent).toPrecision(4) + '%'
