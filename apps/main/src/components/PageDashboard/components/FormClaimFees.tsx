import type { Step } from '@/ui/Stepper/types'

import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import { formatNumber } from '@/ui/utils'
import { breakpoints } from '@/ui/utils/responsive'
import { t } from '@lingui/macro'
import React, { useState } from 'react'
import styled from 'styled-components'

import AlertFormError from '@/components/AlertFormError'
import FormClaimFeesButtons from '@/components/PageDashboard/components/FormClaimFeesButtons'
import { DEFAULT_FORM_STATUS } from '@/components/PageDashboard/utils'
import useStore from '@/store/useStore'


export enum claimButtonsKey {
  '3CRV' = '3CRV',
  crvUSD = 'crvUSD',
}

const FormClaimFees = ({
  activeKey,
  loading,
  walletAddress,
}: {
  activeKey: string
  loading: boolean
  walletAddress: string
}) => {
  const claimFeesAmounts = useStore((state) => state.dashboard.claimableFees[activeKey])
  const formStatus = useStore((state) => state.dashboard.formStatus)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const parsedFormStatus = formStatus.formType === 'CLAIMABLE_FEES' ? formStatus : DEFAULT_FORM_STATUS

  return (
    <Wrapper>
      <div>
        <div>
          {t`veCRV rewards`}
          <Tooltip>{t`Trading fees distributed to CRV lockers`}</Tooltip>:{' '}
        </div>
        <div>
          <strong>{formatNumber(claimFeesAmounts?.[claimButtonsKey['3CRV']], { defaultValue: '-' })}</strong> 3CRV,{' '}
          <strong>{formatNumber(claimFeesAmounts?.[claimButtonsKey.crvUSD], { defaultValue: '-' })}</strong> crvUSD
        </div>
      </div>
      {parsedFormStatus.error && (
        <AlertFormError errorKey={parsedFormStatus.error} handleBtnClose={() => setTxInfoBar(null)} />
      )}
      {txInfoBar}
      <FormClaimFeesButtons
        activeKey={activeKey}
        loading={loading}
        walletAddress={walletAddress}
        steps={steps}
        setSteps={setSteps}
        setTxInfoBar={setTxInfoBar}
      />
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

const Tooltip = styled(IconTooltip)`
  position: relative;
  top: 2px;
`

export default FormClaimFees
