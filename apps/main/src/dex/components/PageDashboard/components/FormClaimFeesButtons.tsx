import type { ButtonProps } from '@ui/Button/types'
import type { Step } from '@ui/Stepper/types'
import React, { useCallback, useMemo, useState } from 'react'
import { t } from '@lingui/macro'
import { DEFAULT_FORM_STATUS } from '@main/components/PageDashboard/utils'
import { claimButtonsKey } from '@main/components/PageDashboard/components/FormClaimFees'
import { useDashboardContext } from '@main/components/PageDashboard/dashboardContext'
import useStore from '@main/store/useStore'
import Button from '@ui/Button'
import Stepper from '@ui/Stepper'
import TxInfoBar from '@ui/TxInfoBar'
import { useWalletStore } from '@ui-kit/features/connect-wallet/store'

const FormClaimFeesButtons = ({
  activeKey,
  loading,
  walletAddress,
  steps,
  setSteps,
  setTxInfoBar,
}: {
  activeKey: string
  loading: boolean
  walletAddress: string
  steps: Step[]
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>
  setTxInfoBar: React.Dispatch<React.SetStateAction<React.ReactNode>>
}) => {
  const { curve, isValidAddress } = useDashboardContext()
  const claimFeesAmounts = useStore((state) => state.dashboard.claimableFees[activeKey])
  const formProcessing = useStore((state) => state.dashboard.formStatus.formProcessing)
  const fetchStepClaimFees = useStore((state) => state.dashboard.fetchStepClaimFees)
  const notifyNotification = useWalletStore((s) => s.notify)
  const setFormStatus = useStore((state) => state.dashboard.setFormStatusClaimFees)

  const { chainId, signerAddress } = curve || {}
  const network = useStore((state) => (chainId ? state.networks.networks[chainId] : null))
  const [claimingKey, setClaimingKey] = useState<claimButtonsKey | ''>('')

  const claimButtons = useMemo(() => {
    const loadingClaimFees = loading && !!walletAddress && typeof claimFeesAmounts === 'undefined'
    const claim3Crv = +(claimFeesAmounts?.[claimButtonsKey['3CRV']] ?? '0')
    const claimCrvUSD = +(claimFeesAmounts?.crvUSD ?? '0')
    const noClaimFees = claim3Crv + claimCrvUSD === 0

    const buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps = {
      disabled: loadingClaimFees || !signerAddress || noClaimFees || !isValidAddress,
      loading: loadingClaimFees || formProcessing,
      variant: 'filled',
      size: 'medium',
    }

    return [
      { buttonProps, label: t`Claim 3CRV`, key: claimButtonsKey['3CRV'], show: claim3Crv > 0 },
      { buttonProps, label: t`Claim crvUSD`, key: claimButtonsKey.crvUSD, show: claimCrvUSD > 0 },
    ]
  }, [claimFeesAmounts, formProcessing, isValidAddress, loading, signerAddress, walletAddress])

  const handleBtnClickClaimFees = useCallback(
    async (key: claimButtonsKey) => {
      if (!network || !curve) return

      const { scanTxPath } = network
      const notifyMessage = t`Please approve claim veCRV rewards.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')

      // loading state
      setClaimingKey(key)
      setSteps([])
      setTxInfoBar(null)

      const resp = await fetchStepClaimFees(activeKey, curve, walletAddress, key)

      if (!resp || resp?.activeKey !== activeKey) return

      if (typeof dismiss === 'function') dismiss()

      if (resp?.error) return

      setSteps([
        {
          key: 'CLAIM',
          status: 'succeeded',
          type: 'action',
          content: t`Claimed ${key}`,
          onClick: () => {},
        },
      ])

      const successMessage =
        key === claimButtonsKey['3CRV']
          ? t`3CRV have been claimed and sent to 3pool.`
          : t`crvUSD has been claimed and sent to your wallet.`

      setTxInfoBar(
        <TxInfoBar
          description={successMessage}
          txHash={scanTxPath(resp.hash)}
          onClose={() => {
            setFormStatus(DEFAULT_FORM_STATUS)
            setSteps([])
            setTxInfoBar(null)
          }}
        />,
      )
    },
    [
      activeKey,
      curve,
      fetchStepClaimFees,
      notifyNotification,
      setFormStatus,
      setSteps,
      setTxInfoBar,
      walletAddress,
      network,
    ],
  )

  return (
    <>
      {claimButtons.map(({ label, key, show, buttonProps }) => {
        const isSuccess = key === claimingKey && steps?.[0]?.status === 'succeeded'
        return (
          (show || isSuccess) && (
            <React.Fragment key={key}>
              {isSuccess ? (
                <Stepper steps={steps} />
              ) : (
                <Button
                  {...buttonProps}
                  loading={buttonProps.loading && claimingKey === key}
                  onClick={() => handleBtnClickClaimFees(key)}
                >
                  {label}
                </Button>
              )}
            </React.Fragment>
          )
        )
      })}
    </>
  )
}

export default FormClaimFeesButtons
