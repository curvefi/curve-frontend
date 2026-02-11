import { useCallback } from 'react'
import { LoanCreateForm } from '@/lend/components/PageLendMarket/LoanFormCreate/LoanCreateForm'
import type { FormValues } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_FORM_VALUES } from '@/lend/components/PageLendMarket/utils'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { hasLeverage } from '@/llamalend/llama.utils'
import { useDebounced } from '@ui-kit/hooks/useDebounce'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanProps = PageContentProps<MarketUrlParams>

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `CreateLoanForm`.
 */
const useOnFormUpdate = ({ api, market }: Pick<CreateLoanProps, 'api' | 'market'>): OnCreateLoanFormUpdate => {
  const [setFormValues] = useDebounced(
    useStore((store) => store.loanCreate.setFormValues),
    Duration.FormDebounce,
  )
  const [setStateByKeys] = useDebounced(
    useStore((store) => store.loanCreate.setStateByKeys),
    Duration.FormDebounce,
  )
  return useCallback(
    async ({ debt, userCollateral, range, slippage, leverageEnabled }) => {
      const formValues: FormValues = {
        ...DEFAULT_FORM_VALUES,
        n: range,
        debt: `${debt ?? ''}`,
        userCollateral: `${userCollateral ?? ''}`,
      }
      await setFormValues(api, market, formValues, `${slippage}`, leverageEnabled)
      setStateByKeys({ isEditLiqRange: true })
    },
    [api, market, setFormValues, setStateByKeys],
  )
}

function CreateLoanTab({ market, api, rChainId }: CreateLoanProps) {
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  const onCreated = useCallback(
    async () => api && market && (await onLoanCreated(api, market)),
    [api, market, onLoanCreated],
  )
  const onUpdate = useOnFormUpdate({ market, api })
  return (
    <CreateLoanForm networks={networks} chainId={rChainId} market={market} onUpdate={onUpdate} onMutated={onCreated} />
  )
}

const LendCreateTabsNewMenu = [
  { value: 'create', label: t`Borrow`, component: CreateLoanTab },
] satisfies FormTab<CreateLoanProps>[]

const LendCreateTabsOldMenu = [
  { value: 'create', label: t`Create Loan`, component: LoanCreateForm },
  {
    value: 'leverage',
    label: t`Leverage`,
    component: (p) => <LoanCreateForm {...p} isLeverage />,
    visible: ({ market }) => market && hasLeverage(market),
  },
] satisfies FormTab<CreateLoanProps>[]

export const LoanCreateTabs = (pageProps: CreateLoanProps) => {
  const menu = useCreateLoanMuiForm() ? LendCreateTabsNewMenu : LendCreateTabsOldMenu
  const shouldWrap = menu === LendCreateTabsOldMenu
  return <FormTabs params={pageProps} menu={menu} shouldWrap={shouldWrap} />
}
