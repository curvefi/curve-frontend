import { useCallback } from 'react'
import { BorrowTabContents } from '@/llamalend/widgets/borrow/components/BorrowTabContents'
import LoanFormCreate from '@/loan/components/PageLoanCreate/LoanFormCreate'
import type { FormType, PageLoanCreateProps } from '@/loan/components/PageLoanCreate/types'
import { hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import useCollateralAlert from '@/loan/hooks/useCollateralAlert'
import networks from '@/loan/networks'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper, AppFormHeader } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'

const LoanCreate = ({
  fetchInitial,
  ...props
}: PageLoanCreateProps & {
  loanExists: boolean | undefined
  fetchInitial: (curve: LlamaApi, isLeverage: boolean, llamma: Llamma) => void
}) => {
  const { curve, llamma, loanExists, params, rCollateralId, rFormType, rChainId } = props
  const push = useNavigate()
  const collateralAlert = useCollateralAlert(llamma?.address)
  const network = networks[rChainId]
  const [isBeta] = useBetaFlag()

  const FORM_TYPES: { key: string; label: string }[] = [
    { label: t`Create Loan`, key: 'create' },
    { label: t`Leverage`, key: 'leverage' },
    ...(isBeta ? [{ label: t`Beta`, key: 'borrow' }] : []),
  ].filter((f) => f.key != 'leverage' || hasLeverage(llamma))

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
    <AppFormContent variant="primary" shadowed>
      <AppFormHeader
        formTypes={FORM_TYPES}
        activeFormKey={!rFormType ? 'create' : (rFormType as string)}
        handleClick={(key: string) => handleTabClick(key as FormType)}
      />

      <AppFormContentWrapper>
        {rFormType === 'borrow' ? (
          <WithSkeleton loading={!llamma}>
            {llamma && <BorrowTabContents network={network} market={llamma} />}
          </WithSkeleton>
        ) : (
          <LoanFormCreate {...props} collateralAlert={collateralAlert} />
        )}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
