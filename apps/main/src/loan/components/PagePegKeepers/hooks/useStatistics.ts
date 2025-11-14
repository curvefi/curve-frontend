import { useReadContracts } from 'wagmi'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { abi as pegkeeperAbi } from '../abi/pegkeeper'
import { abi as pegkeeperDebtCeilingAbi } from '../abi/pegkeeperDebtCeiling'
import { PEG_KEEPERS } from '../constants'

const PEG_KEEPER_DEBT_CEILINGS_CONTRACT_ADDRESS = '0xC9332fdCB1C491Dcc683bAe86Fe3cb70360738BC' as const

const query = {
  staleTime: REFRESH_INTERVAL['5m'],
  refetchInterval: REFRESH_INTERVAL['5m'],
}

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
    query,
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
    query,
  })

  const totalCeiling =
    ceiling &&
    ceiling
      .filter((x) => x.status === 'success')
      .map((x) => x.result)
      .reduce((acc, curr) => acc + curr, 0n)

  return { totalDebt, totalCeiling, isFetchingDebt, isFetchingCeiling, isErrorDebt, isErrorCeiling }
}
