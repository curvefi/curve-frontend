import { LendingVaultFromApi } from '@/entities/vaults'

export const BorrowRateCell = ({ data }: { data: LendingVaultFromApi }) =>
  // const { data: snapshots } = useLendingSnapshots({
  //   blockchainId: data.blockchainId,
  //   contractAddress: data.controllerAddress,
  // })
  data.rates.borrowApyPcent.toPrecision(4) + '%'
