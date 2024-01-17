import type { Balances, EtherContract, VestedTotals } from '@/components/PageCompensation/types'

import React from 'react'

import Compensation from '@/components/PageCompensation/components/Compensation'

const Compensations = ({
  poolId,
  contracts,
  balances,
  vestedTotals,
  ...rest
}: {
  rChainId: ChainId
  curve: CurveApi | null
  poolId: string
  contracts: EtherContract[]
  balances: Balances
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
            vestedTotal={vestedTotal}
          />
        )
      })}
    </>
  )
}

export default Compensations
