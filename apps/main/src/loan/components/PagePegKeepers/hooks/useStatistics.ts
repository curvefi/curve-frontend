import { formatEther } from 'viem'
import { useReadContracts } from 'wagmi'
import type { Decimal } from '@primitives/decimal.utils'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS, PEG_KEEPERS } from '../constants'

const pegkeeperDebtContracts = PEG_KEEPERS.map((pegkeeper) => ({
  abi: pegkeeperAbi,
  address: pegkeeper.address,
  functionName: 'debt',
}))

const pegkeeperDebtCeilingContracts = PEG_KEEPERS.map((pegkeeper) => ({
  abi: pegkeeperDebtCeilingAbi,
  address: PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS,
  functionName: 'debt_ceiling',
  args: [pegkeeper.address],
}))

export function useStatistics() {
  const {
    data: debt,
    isFetching: isFetchingDebt,
    isError: isErrorDebt,
  } = useReadContracts({
    contracts: pegkeeperDebtContracts,
  })

  const totalDebt =
    debt &&
    debt
      .filter((x) => x.status === 'success')
      .map((x) => x.result)
      .reduce((acc, curr) => acc + curr, 0n)

  const {
    data: ceiling,
    isFetching: isFetchingCeiling,
    isError: isErrorCeiling,
  } = useReadContracts({
    contracts: pegkeeperDebtCeilingContracts,
  })

  const totalCeiling =
    ceiling &&
    ceiling
      .filter((x) => x.status === 'success')
      .map((x) => x.result)
      .reduce((acc, curr) => acc + curr, 0n)

  return {
    totalDebt: totalDebt == null ? undefined : (formatEther(totalDebt) as Decimal),
    totalCeiling: totalCeiling == null ? undefined : (formatEther(totalCeiling) as Decimal),
    isFetchingDebt,
    isFetchingCeiling,
    isErrorDebt,
    isErrorCeiling,
  }
}
