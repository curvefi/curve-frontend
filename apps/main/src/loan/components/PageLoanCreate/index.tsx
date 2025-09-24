import { useCallback, useMemo } from 'react'
import { BorrowTabContents } from '@/llamalend/features/borrow/components/BorrowTabContents'
import type { OnBorrowFormUpdate } from '@/llamalend/features/borrow/types'
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
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { ReleaseChannel } from '@ui-kit/utils'

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
  const [releaseChannel] = useReleaseChannel()
  const onUpdate = useOnFormUpdate(props)

  type Tab = 'create' | 'leverage'
  const tabs: TabOption<Tab>[] = useMemo(
    () =>
      releaseChannel === ReleaseChannel.Beta
        ? // the new borrow form contains both create and leverage functionality
          [{ value: 'create' as const, label: t`Borrow` }]
        : [
            { value: 'create' as const, label: t`Create Loan` },
            ...(hasLeverage(llamma) ? [{ value: 'leverage' as const, label: t`Leverage` }] : []),
          ],
    [llamma, releaseChannel],
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
    <>
      <TabsSwitcher
        variant="contained"
        size="medium"
        value={rFormType || 'create'}
        onChange={(key) => handleTabClick(key as FormType)}
        options={tabs}
        fullWidth={releaseChannel == ReleaseChannel.Legacy}
      />
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        <AppFormContentWrapper>
          {releaseChannel === ReleaseChannel.Beta ? (
            <BorrowTabContents
              networks={networks}
              chainId={rChainId}
              market={llamma ?? undefined}
              onUpdate={onUpdate}
            />
          ) : (
            <LoanFormCreate {...props} collateralAlert={collateralAlert} />
          )}
        </AppFormContentWrapper>
      </Stack>
    </>
  )
}

export default LoanCreate
