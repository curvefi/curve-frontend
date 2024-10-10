import React from 'react'
import { t } from '@lingui/macro'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { useSignerAddress } from '@/entities/signer'
import useStore from '@/store/useStore'
import useTokenAlert from '@/hooks/useTokenAlert'

import AlertBox from '@/ui/AlertBox'
import AlertSeedAmounts from '@/components/PagePool/components/AlertSeedAmounts'
import FormConnectWallet from '@/components/FormConnectWallet'

type Props = {
  children: React.ReactNode
}

const TransferActions: React.FC<Props> = ({ children }) => {
  const { isSeed, poolData, poolTvl, signerPoolBalancesIsError } = usePoolContext()

  const { data: signerAddress } = useSignerAddress()

  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const connectState = useStore((state) => state.connectState)

  const isLoading = !poolData || connectState.status === 'loading' || typeof poolTvl === 'undefined' || isSeed === null
  const isShowAlertMessage = alert && !alert.isInformationOnly
  const isSignerPoolBalancesError = !!signerAddress && signerPoolBalancesIsError

  return (
    <>
      {isShowAlertMessage ? <AlertBox alertType={alert.alertType}>{alert.message}</AlertBox> : null}
      <AlertSeedAmounts />
      {isSignerPoolBalancesError && <AlertBox alertType="error">{t`Unable to get wallet balances`}</AlertBox>}
      <FormConnectWallet loading={isLoading}>{children}</FormConnectWallet>
    </>
  )
}

export default TransferActions
