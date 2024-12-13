import { LendingVaultFromApi } from '@/entities/vaults'
import { useLendingSnapshots } from '@/entities/lending'

export const BorrowRateCell = ({ data }: { data: LendingVaultFromApi }) => {
  const { data: snapshots } = useLendingSnapshots({
    blockchainId: data.blockchainId,
    contractAddress: data.controllerAddress,
  })
  return data.rates.borrowApyPcent.toPrecision(4) + '%'
}
