import { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import { FormConnectWallet } from '@/dex/components/FormConnectWallet'
import { AlertSeedAmounts } from '@/dex/components/PagePool/components/AlertSeedAmounts'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolTokenBalances } from '@/dex/hooks/usePoolTokenBalances'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { AlertBox } from '@legacy-ui/AlertBox'

export const TransferActions = ({
  children,
  seed,
  loading,
}: {
  loading?: boolean
  children: ReactNode
} & Pick<TransferProps, 'seed'>) => {
  const { chainId, userAddress: signerAddress, poolId, poolData } = usePoolContext()

  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const { isHydrated } = useCurve()
  const currencyReserves = useStore(state => state.pools.currencyReserves[getChainPoolIdActiveKey(chainId, poolId)])

  const { address: userAddress } = useConnection()
  const { isLoading: walletBalancesLoading, error: walletBalancesError } = usePoolTokenBalances({
    chainId,
    userAddress,
    poolId,
  })

  const isLoading =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
    loading ||
    typeof poolData === 'undefined' ||
    typeof currencyReserves === 'undefined' ||
    !isHydrated ||
    !seed.loaded ||
    walletBalancesLoading

  return (
    <>
      {alert && !alert.isInformationOnly ? <AlertBox alertType={alert.alertType}>{alert.message}</AlertBox> : null}
      <AlertSeedAmounts seed={seed} />
      {signerAddress && walletBalancesError && <AlertBox alertType="error">{walletBalancesError.message}</AlertBox>}
      <FormConnectWallet loading={isLoading}>{children}</FormConnectWallet>
    </>
  )
}
