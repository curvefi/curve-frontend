import { formatEther } from 'viem'
import { useReadContracts, type UseReadContractsReturnType } from 'wagmi'
import { type Decimal } from '@primitives/decimal.utils'
import { mapQuery } from '@ui-kit/types/util'
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

const sumSuccess = (results: NonNullable<UseReadContractsReturnType<typeof pegkeeperDebtContracts>['data']>) =>
  formatEther(
    results
      .filter(x => x.status === 'success')
      .map(x => x.result)
      .reduce((acc, curr) => acc + curr, 0n),
  ) as Decimal

export const useStatistics = () => {
  const totalDebtQuery = useReadContracts({ contracts: pegkeeperDebtContracts })
  const totalCeilingQuery = useReadContracts({ contracts: pegkeeperDebtCeilingContracts })
  return {
    totalDebt: mapQuery(totalDebtQuery, sumSuccess),
    totalCeiling: mapQuery(totalCeilingQuery, sumSuccess),
  }
}
