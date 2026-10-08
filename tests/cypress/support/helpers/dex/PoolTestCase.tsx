import { type ReactNode, useMemo } from 'react'
import { useNetworksQuery } from '@/dex/entities/networks'
import { PoolContextProvider } from '@/dex/features/pool-context'
import { defaultNetworks } from '@/dex/lib/networks'
import { tryGetPool } from '@/dex/pool.utils'
import { useStore } from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import type { TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import { CurveProvider, useCurve } from '@evm-ui/features/connect-wallet'
import { Loading } from '@ui/components/Loading'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'

type PoolDepositTestProps = { chainId: ChainId; poolId: string; children: ReactNode }

function PoolTest({ chainId, poolId, children }: PoolDepositTestProps) {
  const { isPending } = useNetworksQuery()
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(() => (isHydrated ? tryGetPool(poolId, curveApi) : undefined), [poolId, curveApi, isHydrated])

  return isPending || !pool ? (
    <Loading />
  ) : (
    <PoolContextProvider network={defaultNetworks[chainId]} pool={pool}>
      {children}
    </PoolContextProvider>
  )
}

export const PoolTestCase = ({
  vnet,
  account,
  chainId,
  poolId,
  children,
}: PoolDepositTestProps & TenderlyWagmiConfigFromVNet) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, account })} autoConnect>
    <CurveProvider
      app="dex"
      network={defaultNetworks[chainId]}
      onChainUnavailable={console.error}
      hydrate={{ dex: useStore(state => state.hydrate) }}
    >
      <FormPlacementProvider placement="inline">
        <PoolTest poolId={poolId} chainId={chainId}>
          {children}
        </PoolTest>
      </FormPlacementProvider>
    </CurveProvider>
  </ComponentTestWrapper>
)
