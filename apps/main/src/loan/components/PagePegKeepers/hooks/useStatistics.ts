import { formatEther } from 'viem'
import { useReadContracts } from 'wagmi'
import { mapQuery, q } from '@ui-kit/types/util'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS, PEG_KEEPERS } from '../constants'

const pegkeeperDebtContracts = PEG_KEEPERS.map(pegkeeper => ({
  abi: pegkeeperAbi,
  address: pegkeeper.address,
  functionName: 'debt',
}))

const pegkeeperDebtCeilingContracts = PEG_KEEPERS.map(pegkeeper => ({
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
    error: debtError,
  } = useReadContracts({
    contracts: pegkeeperDebtContracts,
  })

  const {
    data: ceiling,
    isFetching: isFetchingCeiling,
    isError: isErrorCeiling,
    error: ceilingError,
  } = useReadContracts({
    contracts: pegkeeperDebtCeilingContracts,
  })

  return {
    totalDebt: mapQuery(q({ data: debt, isLoading: isFetchingDebt, error: debtError }), results =>
      Number(
        formatEther(
          results
            .filter(x => x.status === 'success')
            .map(x => x.result)
            .reduce((acc, curr) => acc + curr, 0n),
        ),
      ),
    ),
    totalCeiling: mapQuery(q({ data: ceiling, isLoading: isFetchingCeiling, error: ceilingError }), results =>
      Number(
        formatEther(
          results
            .filter(x => x.status === 'success')
            .map(x => x.result)
            .reduce((acc, curr) => acc + curr, 0n),
        ),
      ),
    ),
    isErrorDebt,
    isErrorCeiling,
  }
}
