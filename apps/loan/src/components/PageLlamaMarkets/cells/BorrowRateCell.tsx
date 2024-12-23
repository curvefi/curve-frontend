import { LendingVault } from '@/entities/vaults'
import { CellContext } from '@tanstack/react-table'

export const BorrowRateCell = ({ getValue }: CellContext<LendingVault, LendingVault['rates']['borrowApyPcent']>) => {
  // const { data: snapshots } = useLendingSnapshots({
  //   blockchainId: data.blockchainId,
  //   contractAddress: data.controllerAddress,
  // })
  const value = getValue()
  return value ? value.toPrecision(4) + '%' : '-'
}
