import { Compensation } from '@/dex/components/PageCompensation/components/Compensation'
import type { Balances, EtherContract, VestedTotals } from '@/dex/components/PageCompensation/types'
import { CurveApi, ChainId, Provider } from '@/dex/types/main.types'

export const Compensations = ({
  poolId,
  contracts,
  balances,
  provider,
  vestedTotals,
  ...rest
}: {
  rChainId: ChainId
  curve: CurveApi | null
  poolId: string
  contracts: EtherContract[]
  balances: Balances
  provider: Provider
  vestedTotals: VestedTotals
  haveBalancesError: boolean
}) => {
  const poolName = contracts[0].poolName
  return (
    <>
      <h3>{poolName}</h3>
      {contracts.map((contract, idx) => {
        const activeKey = `${poolId}-${idx}`
        const balance = balances[poolId]?.[idx]?.balance
        const vestedTotal = vestedTotals[poolId]?.[idx]?.amount
        return (
          <Compensation
            key={activeKey}
            {...contract}
            {...rest}
            activeKey={activeKey}
            balance={balance}
            provider={provider}
            vestedTotal={vestedTotal}
          />
        )
      })}
    </>
  )
}
