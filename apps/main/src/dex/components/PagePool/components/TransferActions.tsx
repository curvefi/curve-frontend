import { ReactNode } from 'react'
import { useConnection } from 'wagmi'
import FormConnectWallet from '@/dex/components/FormConnectWallet'
import AlertSeedAmounts from '@/dex/components/PagePool/components/AlertSeedAmounts'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useSignerAddress } from '@/dex/entities/signer'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { usePoolTokenBalances } from '@/dex/hooks/usePoolTokenBalances'
import useTokenAlert from '@/dex/hooks/useTokenAlert'
import useStore from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import AlertBox from '@ui/AlertBox'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const TransferActions = ({
  children,
  seed,
  loading,
  poolData,
  routerParams,
}: {
  loading?: boolean
  children: ReactNode
} & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'seed'>) => {
  const { data: signerAddress } = useSignerAddress()
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const { isHydrated } = useCurve()
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, poolId)])

  const { address: userAddress } = useConnection()
  const {
    wrappedCoinsBalances,
    underlyingCoinsBalances,
    isLoading: walletBalancesLoading,
  } = usePoolTokenBalances({
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

  const hasWalletBalances = Object.keys(wrappedCoinsBalances).length && Object.keys(underlyingCoinsBalances).length

  return (
    <>
      {alert && !alert.isInformationOnly ? <AlertBox alertType={alert.alertType}>{alert.message}</AlertBox> : null}
      <AlertSeedAmounts seed={seed} poolData={poolData} />
      {signerAddress && !isLoading && !hasWalletBalances && (
        <AlertBox alertType="error">{t`Unable to get wallet balances`}</AlertBox>
      )}
      <FormConnectWallet loading={isLoading}>{children}</FormConnectWallet>
    </>
  )
}

export default TransferActions
