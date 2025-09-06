import { useCallback } from 'react'
import LoanFormCreate from '@/loan/components/PageLoanCreate/LoanFormCreate'
import type { FormType, PageLoanCreateProps } from '@/loan/components/PageLoanCreate/types'
import { hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import useCollateralAlert from '@/loan/hooks/useCollateralAlert'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const LoanCreate = ({
  fetchInitial,
  ...props
}: PageLoanCreateProps & {
  loanExists: boolean | undefined
  fetchInitial: (curve: LlamaApi, isLeverage: boolean, llamma: Llamma) => void
}) => {
  const { curve, llamma, loanExists, params, rCollateralId, rFormType } = props
  const push = useNavigate()
  const collateralAlert = useCollateralAlert(llamma?.address)

  const FORM_TYPES: { value: string; label: string }[] = [
    { value: 'create', label: t`Create Loan` },
    { value: 'leverage', label: t`Leverage` },
  ].filter((f) => {
    if (f.value === 'leverage') {
      return hasLeverage(llamma)
    } else {
      return true
    }
  })

  const handleTabClick = useCallback(
    (formType: FormType) => {
      if (loanExists) {
        push(getLoanManagePathname(params, rCollateralId, 'loan'))
      } else {
        if (curve && llamma) {
          fetchInitial(curve, formType === 'leverage', llamma)
        }
        push(getLoanCreatePathname(params, rCollateralId, formType))
      }
    },
    [curve, fetchInitial, llamma, loanExists, push, params, rCollateralId],
  )

  return (
    <AppFormContent variant="primary">
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={!rFormType ? 'create' : rFormType}
        onChange={(key) => handleTabClick(key as FormType)}
        options={FORM_TYPES}
      />

      <AppFormContentWrapper>
        <LoanFormCreate {...props} collateralAlert={collateralAlert} />
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
