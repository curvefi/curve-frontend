import type { TransferProps } from '@main/components/PagePool/types'

import React from 'react'
import { t } from '@lingui/macro'

import { getChainPoolIdActiveKey } from '@main/utils'
import useStore from '@main/store/useStore'
import useTokenAlert from '@main/hooks/useTokenAlert'

import AlertBox from '@ui/AlertBox'
import AlertSeedAmounts from '@main/components/PagePool/components/AlertSeedAmounts'
import FormConnectWallet from '@main/components/FormConnectWallet'
import { useSignerAddress } from '@main/entities/signer'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

const TransferActions = ({
  children,
  seed,
  loading,
  poolData,
  routerParams,
  userPoolBalances,
}: React.PropsWithChildren<
  {
    loading?: boolean
  } & Pick<TransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'seed' | 'userPoolBalances'>
>) => {
  const { data: signerAddress } = useSignerAddress()
  const { rChainId, rPoolId } = routerParams
  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const connectState = useWalletStore((s) => s.connectState)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])
  const walletBalancesLoading = useStore((state) => state.user.walletBalancesLoading)

  const isLoading =
    loading ||
    typeof poolData === 'undefined' ||
    typeof currencyReserves === 'undefined' ||
    connectState.status === 'loading' ||
    !seed.loaded

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
