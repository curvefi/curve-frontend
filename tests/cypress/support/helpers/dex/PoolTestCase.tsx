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
import type { Address } from '@primitives/address.utils'
import { Loading } from '@ui/components/Loading'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'
import { constQ } from '@ui/features/queries/util'

type PoolDepositTestProps = { chainId: ChainId; poolAddress: Address; children: ReactNode }

function PoolTest({ chainId, poolAddress, children }: PoolDepositTestProps) {
  const { isPending } = useNetworksQuery()
  const { curveApi, isHydrated } = useCurve()
  const pool = useMemo(
    () => (isHydrated ? tryGetPool(poolAddress, curveApi) : undefined),
    [poolAddress, curveApi, isHydrated],
  )

  return isPending || !pool ? (
    <Loading />
  ) : (
    <PoolContextProvider network={defaultNetworks[chainId]} pool={constQ(pool)} poolAddress={poolAddress}>
      {children}
    </PoolContextProvider>
  )
}

export const PoolTestCase = ({
  vnet,
  account,
  chainId,
  poolAddress,
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
        <PoolTest poolAddress={poolAddress} chainId={chainId}>
          {children}
        </PoolTest>
      </FormPlacementProvider>
    </CurveProvider>
  </ComponentTestWrapper>
)
