import type { Step } from '@/ui/Stepper/types'

import { t, Trans } from '@lingui/macro'
import cloneDeep from 'lodash/cloneDeep'
import styled from 'styled-components'
import React, { useCallback, useState } from 'react'

import { DEFAULT_FORM_STATUS } from '@/components/PageDashboard/utils'
import { breakpoints } from '@/ui/utils/responsive'
import { formatNumber } from '@/ui/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

import AlertFormError from '@/components/AlertFormError'
import Button from '@/ui/Button'
import IconTooltip from '@/ui/IconTooltip'
import Stepper from '@/ui/Stepper'
import TxInfoBar from '@/ui/TxInfoBar'

const DEFAULT_FORM_CLAIM_FEES_STEPS: Step[] = [
  {
    key: 'CLAIM',
    status: 'succeeded',
    type: 'action',
    content: '',
    onClick: () => {},
  },
]

const FormClaimFees = ({
  curve,
  activeKey,
  loading,
  walletAddress,
}: {
  curve: CurveApi | null
  activeKey: string
  loading: boolean
  walletAddress: string
}) => {
  const claimFeesAmount = useStore((state) => state.dashboard.claimableFees[activeKey])
  const formStatus = useStore((state) => state.dashboard.formStatus)
  const isValidWalletAddress = useStore((state) => state.dashboard.isValidWalletAddress[activeKey])
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const setFormStatus = useStore((state) => state.dashboard.setFormStatusClaimFees)
  const fetchClaimableFees = useStore((state) => state.dashboard.fetchClaimableFees)
  const fetchStepClaimFees = useStore((state) => state.dashboard.fetchStepClaimFees)

  const [steps, setSteps] = useState<Step[]>(DEFAULT_FORM_CLAIM_FEES_STEPS)
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = curve ?? {}
  const parsedFormStatus = formStatus.formType === 'CLAIMABLE_FEES' ? formStatus : DEFAULT_FORM_STATUS

  const handleBtnClickClaimFees = useCallback(
    async (curve: CurveApi) => {
      const notifyMessage = t`Please approve claim veCRV rewards.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchStepClaimFees(activeKey, curve, walletAddress)

      if (resp && resp.hash && resp.activeKey === activeKey) {
        let updatedSteps: Step[] = cloneDeep(steps)
        updatedSteps[0].content = 'Claimed'
        setSteps(updatedSteps)

        setTxInfoBar(
          <TxInfoBar
            description={t`The rewards you claimed are viewable in 3pool.`}
            txHash={networks[curve.chainId].scanTxPath(resp.hash)}
            onClose={() => {
              updatedSteps[0].content = ''
              setSteps(updatedSteps)
              setTxInfoBar(null)
              setFormStatus(DEFAULT_FORM_STATUS)
            }}
          />
        )
      }
      if (typeof dismiss === 'function') dismiss()
    },
    [activeKey, fetchStepClaimFees, notifyNotification, setFormStatus, steps, walletAddress]
  )

  const loadingClaimFees = loading && !!walletAddress && typeof claimFeesAmount === 'undefined'

  return (
    <Wrapper>
      <div>
        <Trans>
          veCRV rewards: <strong>{formatNumber(claimFeesAmount, { defaultValue: '-' })}</strong> 3CRV
        </Trans>
        <IconTooltip placement="top end">{t`Trading fees distributed to CRV lockers`}</IconTooltip>
      </div>
      {parsedFormStatus.error && (
        <AlertFormError
          errorKey={parsedFormStatus.error}
          handleBtnClose={() => {
            setTxInfoBar(null)
            if (curve) {
              fetchClaimableFees(activeKey, curve, walletAddress)
            }
          }}
        />
      )}
      {txInfoBar}
      {!!steps[0].content ? (
        <Stepper steps={steps} />
      ) : (
        <Button
          disabled={loadingClaimFees || !signerAddress || +claimFeesAmount === 0 || !isValidWalletAddress}
          loading={loadingClaimFees || formStatus.formProcessing}
          variant="filled"
          onClick={() => {
            if (curve) handleBtnClickClaimFees(curve)
          }}
          size="medium"
        >
          {t`Claim LP rewards`}
        </Button>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: grid;
  grid-row-gap: 0.5rem;
  margin-top: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    max-width: 18.75rem;
  }
`

export default FormClaimFees
