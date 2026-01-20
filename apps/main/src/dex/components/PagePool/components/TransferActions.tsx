import { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { FormConnectWallet } from '@/dex/components/FormConnectWallet'
import { AlertSeedAmounts } from '@/dex/components/PagePool/components/AlertSeedAmounts'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTokenBalances } from '@/dex/hooks/usePoolTokenBalances'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { AlertBox } from '@ui/AlertBox'
import { useCurve } from '@ui-kit/features/connect-wallet'

export const TransferActions = ({
  children,
  seed,
  loading,
  poolData,
  routerParams,
}: {
  loading?: boolean
  children: ReactNode
} & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'seed'>) => {
  const { address: signerAddress } = useConnection()
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const { isHydrated } = useCurve()
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, poolId)])

  const { address: userAddress } = useConnection()
  const { isLoading: walletBalancesLoading, error: walletBalancesError } = usePoolTokenBalances({
    chainId: rChainId,
    userAddress,
    poolId,
  })

  const isLoading =
    loading ||
    typeof poolData === 'undefined' ||
    typeof currencyReserves === 'undefined' ||
    !isHydrated ||
    !seed.loaded ||
    walletBalancesLoading

  return (
    <>
      {alert && !alert.isInformationOnly ? <AlertBox alertType={alert.alertType}>{alert.message}</AlertBox> : null}
      <AlertSeedAmounts seed={seed} poolData={poolData} />
      {signerAddress && walletBalancesError && <AlertBox alertType="error">{walletBalancesError.message}</AlertBox>}
      <FormConnectWallet loading={isLoading}>{children}</FormConnectWallet>
    </>
  )
}
