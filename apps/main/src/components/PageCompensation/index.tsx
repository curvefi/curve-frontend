import type { Balances, EtherContract, VestedTotals } from '@/components/PageCompensation/types'

import { Contract, ContractRunner, Interface } from 'ethers'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import groupBy from 'lodash/groupBy'

import { getErrorMessage } from '@/utils'

import AlertFormError from '@/components/AlertFormError'
import Box from '@/ui/Box'
import Compensations from '@/components/PageCompensation/components/Compensations'

const FormCompensation = ({
  rChainId,
  curve,
  contracts,
  provider,
}: {
  rChainId: ChainId
  curve: CurveApi | null
  contracts: EtherContract[]
  provider: Provider
}) => {
  const { signerAddress } = curve ?? {}

  const [error, setError] = useState('')
  const [balances, setBalances] = useState<Balances>({})
  const [vestedTotals, setVestedTotals] = useState<VestedTotals>({})

  const groupedContracts = useMemo(() => groupBy(contracts, (c) => c.poolId), [contracts])

  const getBalances = useCallback(async (signerAddress: string, contracts: EtherContract[]) => {
    try {
      setError('')
      const balances = await Promise.all(contracts.map((c) => c.contract.balanceOf(signerAddress)))
      const mappedBalances = contracts.map(({ poolId }, idx) => ({ poolId, balance: Number(balances[idx]) / 1e18 }))
      const groupedBalances = groupBy(mappedBalances, ({ poolId }) => poolId)
      setBalances(groupedBalances)
    } catch (error) {
      console.error(error)
      setError(getErrorMessage(error, 'error'))
    }
  }, [])

  const getVestedAmount = useCallback(
    async (
      vestAddress: string,
      iface: Interface,
      etherContract: EtherContract,
      idx: number,
      signerAddress: string,
      signer: ContractRunner,
    ) => {
      const { contractAddress, token, poolId } = etherContract
      const defaultVestedTotal = { poolId, amount: 0 }
      if (token === 'CRV') {
        try {
          const vestContract = new Contract(vestAddress, iface.format(), signer)
          const unvested = await vestContract.lockedOf(contractAddress)
          const fractions = await contracts[idx].contract.fractions(signerAddress)
          const totalFraction = await contracts[idx].contract.total_fraction()

          return { poolId, amount: ((Number(unvested) / 1e18) * Number(fractions)) / Number(totalFraction) }
        } catch (error) {
          console.error(`Unable to get remaining vested for ${poolId}'s ${token}`, error)
          return defaultVestedTotal
        }
      } else {
        return defaultVestedTotal
      }
    },
    [contracts],
  )

  const getVestContract = useCallback(
    async (signerAddress: string, contracts: EtherContract[]) => {
      try {
        const signer = await provider.getSigner()
        const vestAddresses = await Promise.all(contracts.map((c) => c.contract.vest()))
        const abi = await import('@/components/PageCompensation/abis/vest_abi.json').then((module) => module.default)
        // @ts-ignore
        const iface = new Interface(abi)
        const vestedTotals = await Promise.all(
          vestAddresses.map((vc, idx) => getVestedAmount(vc, iface, contracts[idx], idx, signerAddress, signer)),
        )
        setVestedTotals(groupBy(vestedTotals, ({ poolId }) => poolId))
      } catch (error) {
        console.error(error)
      }
    },
    [getVestedAmount, provider],
  )

  useEffect(() => {
    // reset state
    setError('')
    setBalances({})
    setVestedTotals({})

    if (signerAddress) {
      getBalances(signerAddress, contracts)
      getVestContract(signerAddress, contracts)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signerAddress])

  return (
    <Box grid gridRowGap={2}>
      {error && <AlertFormError errorKey={error} />}
      {Object.entries(groupedContracts).map(([poolId, contracts]) => {
        return (
          <Box key={poolId}>
            <Compensations
              rChainId={rChainId}
              curve={curve}
              poolId={poolId}
              contracts={contracts}
              balances={balances}
              provider={provider}
              vestedTotals={vestedTotals}
              haveBalancesError={!!error}
            />
          </Box>
        )
      })}
    </Box>
  )
}

export default FormCompensation
