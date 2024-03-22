import type { FormType, PageLoanCreateProps } from '@/components/PageLoanCreate/types'

import { t } from '@lingui/macro'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { getLoanCreatePathname, getLoanManagePathname } from '@/utils/utilsRouter'
import { hasLeverage } from '@/components/PageLoanCreate/utils'
import useCollateralAlert from '@/hooks/useCollateralAlert'

import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@/ui/AppForm'
import LoanFormCreate from '@/components/PageLoanCreate/LoanFormCreate'

const LoanCreate = ({
  fetchInitial,
  ...props
}: PageLoanCreateProps & {
  loanExists: boolean | undefined
  fetchInitial: (curve: Curve, isLeverage: boolean, llamma: Llamma) => void
}) => {
  const { curve, llamma, loanExists, params, rCollateralId, rFormType } = props
  const navigate = useNavigate()
  const collateralAlert = useCollateralAlert(llamma?.address)

  const FORM_TYPES: { key: string; label: string }[] = [
    { label: t`Create Loan`, key: 'create' },
    { label: t`Leverage`, key: 'leverage' },
  ].filter((f) => {
    if (f.key === 'leverage') {
      return hasLeverage(llamma)
    } else {
      return true
    }
  })

  const handleTabClick = useCallback(
    (formType: FormType) => {
      if (loanExists) {
        navigate(getLoanManagePathname(params, rCollateralId, 'loan'))
      } else {
        if (curve && llamma) {
          fetchInitial(curve, formType === 'leverage', llamma)
        }
        navigate(getLoanCreatePathname(params, rCollateralId, formType))
      }
    },
    [curve, fetchInitial, llamma, loanExists, navigate, params, rCollateralId]
  )

  return (
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'create' : (rFormType as string)}
        handleClick={(key: string) => handleTabClick(key as FormType)}
      />

      <AppFormContentWrapper>
        <LoanFormCreate {...props} collateralAlert={collateralAlert} />
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
