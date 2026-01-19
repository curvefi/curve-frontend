import { useCallback } from 'react'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import type { CreateLoanMutation, CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import { LoanFormCreate } from '@/loan/components/PageMintMarket/LoanFormCreate'
import type { FormValues, PageLoanCreateProps } from '@/loan/components/PageMintMarket/types'
import { DEFAULT_FORM_VALUES } from '@/loan/components/PageMintMarket/utils'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { hasV1Leverage } from '@/loan/utils/leverage'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `CreateLoanForm`.
 */
const useOnFormUpdate = ({ curve, market }: Pick<PageLoanCreateProps, 'market' | 'curve'>): OnCreateLoanFormUpdate =>
  useCallback(
    async ({ debt, userCollateral, range, slippage, leverageEnabled }) => {
      if (!curve || !market) return
      const { setFormValues, setStateByKeys } = useStore.getState().loanCreate
      const formValues: FormValues = {
        ...DEFAULT_FORM_VALUES,
        n: range,
        debt: `${debt ?? ''}`,
        collateral: `${userCollateral ?? ''}`,
      }
      await setFormValues(curve, leverageEnabled, market, formValues, `${slippage}`)
      setStateByKeys({ isEditLiqRange: true })
    },
    [curve, market],
  )

function CreateLoanTab({ market, curve, rChainId }: PageLoanCreateProps) {
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  const onCreated: NonNullable<CreateLoanOptions['onCreated']> = useCallback(
    async (_data, _receipt, { slippage, leverageEnabled }: CreateLoanMutation) =>
      curve && market && (await onLoanCreated(curve, leverageEnabled, market, slippage)),
    [curve, market, onLoanCreated],
  )

  const onUpdate = useOnFormUpdate({ market, curve })
  return (
    <CreateLoanForm
      networks={networks}
      chainId={rChainId}
      market={market ?? undefined}
      onUpdate={onUpdate}
      onCreated={onCreated}
    />
  )
}

const LendCreateTabsNewMenu = [
  { value: 'create', label: t`Borrow`, component: CreateLoanTab },
] satisfies FormTab<PageLoanCreateProps>[]

const LendCreateTabsOldMenu = [
  { value: 'create', label: t`Create Loan`, component: LoanFormCreate },
  {
    value: 'leverage',
    label: t`Leverage`,
    component: (p) => <LoanFormCreate {...p} isLeverage />,
    visible: ({ market }) => market && hasV1Leverage(market),
  },
] satisfies FormTab<PageLoanCreateProps>[]

export const CreateLoanTabs = (props: PageLoanCreateProps) => {
  const menu = useCreateLoanMuiForm() ? LendCreateTabsNewMenu : LendCreateTabsOldMenu
  const shouldWrap = menu === LendCreateTabsOldMenu
  return <FormTabs params={props} menu={menu} shouldWrap={shouldWrap} />
}
