import { useReadContracts } from 'wagmi'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { PEG_KEEPERS } from '../constants'

const query = {
  staleTime: REFRESH_INTERVAL['5m'],
  refetchInterval: REFRESH_INTERVAL['5m'],
}

const pegkeeperDebtContracts = PEG_KEEPERS.map((pegkeeper) => ({
  abi: pegkeeperAbi,
  address: pegkeeper.address,
  functionName: 'debt',
}))

export function useStatistics() {
  const { data: debt, isFetching } = useReadContracts({
    contracts: pegkeeperDebtContracts,
    query,
  })

  const totalDebt =
    debt &&
    debt
      .filter((x) => x.status === 'success')
      .map((x) => x.result)
      .reduce((acc, curr) => acc + curr, 0n)

  return { data: totalDebt, isFetching }
}
