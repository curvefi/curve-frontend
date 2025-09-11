import { useCallback } from 'react'
import type { OnBorrowFormUpdate } from '@/llamalend/widgets/borrow/borrow.types'
import { BorrowTabContents } from '@/llamalend/widgets/borrow/components/BorrowTabContents'
import LoanFormCreate from '@/loan/components/PageLoanCreate/LoanFormCreate'
import type { FormType, FormValues, PageLoanCreateProps } from '@/loan/components/PageLoanCreate/types'
import { hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import useCollateralAlert from '@/loan/hooks/useCollateralAlert'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import { AppFormContent, AppFormContentWrapper } from '@ui/AppForm'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate } from '@ui-kit/hooks/router'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `BorrowTabContents`.
 * @param curve
 * @param llamma
 * @param rFormType
 */
const useOnFormUpdate = ({ curve, llamma, rFormType }: PageLoanCreateProps): OnBorrowFormUpdate =>
  useCallback(
    async ({ debt, userCollateral, range }) => {
      if (!curve || !llamma) return
      const { setFormValues, setStateByKeys } = useStore.getState().loanCreate
      const formValues: FormValues = {
        n: range,
        debt: `${debt ?? 0}`,
        collateral: `${userCollateral ?? 0}`,
        debtError: 'too-much',
        collateralError: 'too-much',
      }
      const { maxSlippage } = useUserProfileStore.getState()
      const isLeverage = rFormType === 'leverage'
      await setFormValues(curve, isLeverage, llamma, formValues, maxSlippage.crypto)
      setStateByKeys({ isEditLiqRange: true })
    },
    [curve, llamma, rFormType],
  )

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
  const onUpdate = useOnFormUpdate(props)

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
        value={rFormType || 'create'}
        onChange={(key) => handleTabClick(key as FormType)}
        options={FORM_TYPES}
      />

      <AppFormContentWrapper>
        {rFormType === 'borrow' ? (
          <BorrowTabContents network={network} market={llamma ?? undefined} onUpdate={onUpdate} />
        ) : (
          <LoanFormCreate {...props} collateralAlert={collateralAlert} />
        )}
      </AppFormContentWrapper>
    </AppFormContent>
  )
}

export default LoanCreate
