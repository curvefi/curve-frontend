import { ReactNode, useState } from 'react'
import { styled } from 'styled-components'
import { AlertFormError } from '@/dex/components/AlertFormError'
import { FormClaimFeesButtons } from '@/dex/components/PageDashboard/components/FormClaimFeesButtons'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { DEFAULT_FORM_STATUS } from '@/dex/components/PageDashboard/utils'
import { useStore } from '@/dex/store/useStore'
import { claimButtonsKey } from '@/dex/types/main.types'
import type { Step } from '@ui/Stepper/types'
import { TooltipIcon as IconTooltip } from '@ui/Tooltip/TooltipIcon'
import { formatNumber } from '@ui/utils'
import { breakpoints } from '@ui/utils/responsive'
import { t } from '@ui-kit/lib/i18n'

export const FormClaimFees = () => {
  const {
    activeKey,
    isLoading,
    formValues: { walletAddress },
  } = useDashboardContext()

  const claimFeesAmounts = useStore((state) => state.dashboard.claimableFees[activeKey])
  const formStatus = useStore((state) => state.dashboard.formStatus)

  const [steps, setSteps] = useState<Step[]>([])
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

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
