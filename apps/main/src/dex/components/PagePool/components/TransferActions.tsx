import { ReactNode } from 'react'
import FormConnectWallet from '@/dex/components/FormConnectWallet'
import AlertSeedAmounts from '@/dex/components/PagePool/components/AlertSeedAmounts'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useSignerAddress } from '@/dex/entities/signer'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import useTokenAlert from '@/dex/hooks/useTokenAlert'
import useStore from '@/dex/store/useStore'
import { getChainPoolIdActiveKey } from '@/dex/utils'
import AlertBox from '@ui/AlertBox'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

const TransferActions = ({
  children,
  seed,
  loading,
  poolData,
  routerParams,
  userPoolBalances,
}: {
  loading?: boolean
  children: ReactNode
} & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'seed' | 'userPoolBalances'>) => {
  const { data: signerAddress } = useSignerAddress()
  const { rChainId, rPoolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId: rChainId, poolIdOrAddress: rPoolIdOrAddress })
  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const { isHydrated } = useConnection()
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, poolId)])
  const walletBalancesLoading = useStore((state) => state.user.walletBalancesLoading)

  const isLoading =
    loading || typeof poolData === 'undefined' || typeof currencyReserves === 'undefined' || !isHydrated || !seed.loaded

  return (
    <>
      {alert && !alert.isInformationOnly ? <AlertBox alertType={alert.alertType}>{alert.message}</AlertBox> : null}
      <AlertSeedAmounts seed={seed} poolData={poolData} />
      {signerAddress && !isLoading && !walletBalancesLoading && typeof userPoolBalances === 'undefined' && (
        <AlertBox alertType="error">{t`Unable to get wallet balances`}</AlertBox>
      )}
      <FormConnectWallet loading={isLoading}>{children}</FormConnectWallet>
    </>
  )
}

export default TransferActions
