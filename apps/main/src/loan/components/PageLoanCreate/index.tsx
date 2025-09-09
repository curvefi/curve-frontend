import { useCallback } from 'react'
import { BorrowTabContents } from '@/llamalend/widgets/borrow/components/BorrowTabContents'
import LoanFormCreate from '@/loan/components/PageLoanCreate/LoanFormCreate'
import type { FormType, PageLoanCreateProps } from '@/loan/components/PageLoanCreate/types'
import { hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import useCollateralAlert from '@/loan/hooks/useCollateralAlert'
import networks from '@/loan/networks'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

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

  const FORM_TYPES: { value: string; label: string }[] = [
    { label: t`Create Loan`, value: 'create' },
    { label: t`Leverage`, value: 'leverage' },
    ...(isBeta ? [{ label: t`Beta`, value: 'borrow' }] : []),
  ].filter((f) => f.value != 'leverage' || hasLeverage(llamma))

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
        {rFormType === 'borrow' ? (
          <BorrowTabContents networks={networks} chainId={rChainId} market={llamma ?? undefined} />
        ) : (
          <LoanFormCreate {...props} collateralAlert={collateralAlert} />
        )}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
