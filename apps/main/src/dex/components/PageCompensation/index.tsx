import { Contract, ContractRunner, Interface } from 'ethers'
import type { InterfaceAbi } from 'ethers'
import lodash from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { Compensations } from '@/dex/components/PageCompensation/components/Compensations'
import type { Balances, EtherContract, VestedTotals } from '@/dex/components/PageCompensation/types'
import { CurveApi, ChainId, Provider } from '@/dex/types/main.types'
import { Box } from '@legacy-ui/Box'
import { Decimal } from '@primitives/decimal.utils'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { decimalDiv, decimalMultiply } from '@ui/lib/decimal'

const getVestedAmount = async (
  vestAddress: string,
  iface: Interface,
  { contract, contractAddress, token, poolId }: EtherContract,
  signerAddress: string,
  signer: ContractRunner,
) => {
  if (token === 'CRV') {
    try {
      const vestContract = new Contract(vestAddress, iface.format(), signer)
      const [unvested, fractions, totalFraction] = (await Promise.all([
        vestContract.lockedOf(contractAddress),
        contract.fractions(signerAddress),
        contract.total_fraction(),
      ])) as [Decimal, Decimal, Decimal]
      return { poolId, amount: +decimalDiv(decimalMultiply(decimalDiv(unvested, '1e18'), fractions), totalFraction) }
    } catch (error) {
      console.error(`Unable to get remaining vested for ${poolId}'s ${token}`, error)
    }
  }
  return { poolId, amount: 0 }
}

export const FormCompensation = ({
  chainId,
  curve,
  contracts,
  provider,
}: {
  chainId: ChainId
  curve: CurveApi | null
  contracts: EtherContract[]
  provider: Provider
}) => {
  const { signerAddress } = curve ?? {}

  const request = useMemo(() => ({ signerAddress, contracts, provider }), [signerAddress, contracts, provider])
  const [result, setResult] = useState<{
    request: typeof request
    error: string
    balances: Balances
    vestedTotals: VestedTotals
  }>({ request, error: '', balances: {}, vestedTotals: {} })

  if (result.request !== request) {
    setResult({ request, error: '', balances: {}, vestedTotals: {} })
  }
  const { error, balances, vestedTotals } = result

  const groupedContracts = useMemo(() => lodash.groupBy(contracts, c => c.poolId), [contracts])

  useEffect(() => {
    const { signerAddress, contracts, provider } = request
    if (!signerAddress) return
    let cancelled = false
    const update = (patch: Partial<Omit<typeof result, 'request'>>) => {
      if (!cancelled) setResult(current => (current.request === request ? { ...current, ...patch } : current))
    }

    const getBalances = async () => {
      try {
        const balances = await Promise.all(contracts.map(c => c.contract.balanceOf(signerAddress)))
        const mappedBalances = contracts.map(({ poolId }, idx) => ({ poolId, balance: Number(balances[idx]) / 1e18 }))
        update({ balances: lodash.groupBy(mappedBalances, ({ poolId }) => poolId) })
      } catch (error) {
        if (cancelled) return
        console.error(error)
        update({ error: getErrorMessage(error, 'error') })
      }
    }

    const getVestContract = async () => {
      try {
        const signer = await provider.getSigner()
        const vestAddresses = await Promise.all(contracts.map(c => c.contract.vest()))
        const abi = await import('@/dex/components/PageCompensation/abis/vest_abi.json').then(module => module.default)
        const iface = new Interface(abi as InterfaceAbi)
        const vestedTotals = await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Existing violation before enabling this rule.
          vestAddresses.map((vc, idx) => getVestedAmount(vc, iface, contracts[idx], signerAddress, signer)),
        )
        update({ vestedTotals: lodash.groupBy(vestedTotals, ({ poolId }) => poolId) })
      } catch (error) {
        if (!cancelled) console.error(error)
      }
    }

    void getBalances()
    void getVestContract()
    return () => {
      cancelled = true
    }
  }, [request])

  return (
    <Box grid gridRowGap={2}>
      {error && <AlertFormError errorKey={error} />}
      {Object.entries(groupedContracts).map(([poolId, contracts]) => (
        <Box key={poolId}>
          <Compensations
            chainId={chainId}
            curve={curve}
            poolId={poolId}
            contracts={contracts}
            balances={balances}
            provider={provider}
            vestedTotals={vestedTotals}
            haveBalancesError={!!error}
          />
        </Box>
      ))}
    </Box>
  )
}
