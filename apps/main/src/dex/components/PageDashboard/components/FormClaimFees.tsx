import type { Step } from '@ui/Stepper/types'

import React, { useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { DEFAULT_FORM_STATUS } from '@/dex/components/PageDashboard/utils'
import { breakpoints } from '@ui/utils/responsive'
import { formatNumber } from '@ui/utils'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import useStore from '@/dex/store/useStore'

import AlertFormError from '@/dex/components/AlertFormError'
import FormClaimFeesButtons from '@/dex/components/PageDashboard/components/FormClaimFeesButtons'
import IconTooltip from '@ui/Tooltip/TooltipIcon'

export enum claimButtonsKey {
  '3CRV' = '3CRV',
  crvUSD = 'crvUSD',
}

const FormClaimFees: React.FC = () => {
  const {
    activeKey,
    isLoading,
    formValues: { walletAddress },
  } = useDashboardContext()

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
      {parsedFormStatus.error && <AlertFormError errorKey={parsedFormStatus.error} />}
      {txInfoBar}
      <FormClaimFeesButtons
        activeKey={activeKey}
        loading={isLoading}
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
