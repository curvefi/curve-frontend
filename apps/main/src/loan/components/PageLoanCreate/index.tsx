import { useCallback, useMemo } from 'react'
import { BorrowTabContents } from '@/llamalend/features/borrow/components/BorrowTabContents'
import type { OnBorrowFormUpdate } from '@/llamalend/features/borrow/types'
import type { BorrowMutation, CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import LoanFormCreate from '@/loan/components/PageLoanCreate/LoanFormCreate'
import type { FormType, FormValues, PageLoanCreateProps } from '@/loan/components/PageLoanCreate/types'
import { DEFAULT_FORM_VALUES, hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import useCollateralAlert from '@/loan/hooks/useCollateralAlert'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { LlamaApi, Llamma } from '@/loan/types/loan.types'
import { getLoanCreatePathname, getLoanManagePathname } from '@/loan/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { useNavigate } from '@ui-kit/hooks/router'
import { useBorrowUnifiedForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `BorrowTabContents`.
 */
const useOnFormUpdate = ({ curve, llamma }: PageLoanCreateProps): OnBorrowFormUpdate =>
  useCallback(
    async ({ debt, userCollateral, range, slippage, leverageEnabled }) => {
      if (!curve || !llamma) return
      const { setFormValues, setStateByKeys } = useStore.getState().loanCreate
      const formValues: FormValues = {
        ...DEFAULT_FORM_VALUES,
        n: range,
        debt: `${debt ?? ''}`,
        collateral: `${userCollateral ?? ''}`,
      }
      await setFormValues(curve, leverageEnabled, llamma, formValues, `${slippage}`)
      setStateByKeys({ isEditLiqRange: true })
    },
    [curve, llamma],
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
  const isBorrowUnifiedForm = useBorrowUnifiedForm()
  const onUpdate = useOnFormUpdate(props)
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)

  const onCreated: CreateLoanOptions['onCreated'] = useCallback(
    async (_data, _receipt, { slippage, leverageEnabled }: BorrowMutation) =>
      curve && llamma && (await onLoanCreated(curve, leverageEnabled, llamma, slippage)),
    [curve, llamma, onLoanCreated],
  )

  type Tab = 'create' | 'leverage'
  const tabs: TabOption<Tab>[] = useMemo(
    () =>
      isBorrowUnifiedForm
        ? // the new borrow form contains both create and leverage functionality
          [{ value: 'create' as const, label: t`Borrow` }]
        : [
            { value: 'create' as const, label: t`Create Loan` },
            ...(hasLeverage(llamma) ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
          ],
    [llamma, isBorrowUnifiedForm],
  )

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
    <Stack
      sx={{
        width: { mobile: '100%', tablet: MaxWidth.actionCard },
        marginInline: { mobile: 'auto', desktop: 0 },
      }}
    >
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={rFormType || 'create'}
        onChange={(key) => handleTabClick(key as FormType)}
        options={tabs}
      />
      {isBorrowUnifiedForm ? (
        <BorrowTabContents
          networks={networks}
          chainId={rChainId}
          market={llamma ?? undefined}
          onUpdate={onUpdate}
          onCreated={onCreated}
        />
      ) : (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
          <AppFormContentWrapper>
            <LoanFormCreate {...props} collateralAlert={collateralAlert} />
          </AppFormContentWrapper>
        </Stack>
      )}
    </Stack>
  )
}

export default LoanCreate
