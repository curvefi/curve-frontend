import { useCallback } from 'react'
import LoanFormCreate from '@/lend/components/PageLoanCreate/LoanFormCreate'
import type { FormValues } from '@/lend/components/PageLoanCreate/types'
import { DEFAULT_FORM_VALUES } from '@/lend/components/PageLoanCreate/utils'
import networks from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnBorrowFormUpdate } from '@/llamalend/features/borrow/types'
import { hasLeverage } from '@/llamalend/llama.utils'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/shared/ui/FormTabs/FormTabs'

type CreateLoanProps = PageContentProps<MarketUrlParams>

/**
 * Callback that synchronizes the `ChartOhlc` component with the `RangeSlider` component in the new `BorrowTabContents`.
 */
const useOnFormUpdate = ({ api, market }: Pick<CreateLoanProps, 'api' | 'market'>): OnBorrowFormUpdate =>
  useCallback(
    async ({ debt, userCollateral, range, slippage, leverageEnabled }) => {
      const { setFormValues, setStateByKeys } = useStore.getState().loanCreate
      const formValues: FormValues = {
        ...DEFAULT_FORM_VALUES,
        n: range,
        debt: `${debt ?? ''}`,
        userCollateral: `${userCollateral ?? ''}`,
      }
      await setFormValues(api, market, formValues, `${slippage}`, leverageEnabled)
      setStateByKeys({ isEditLiqRange: true })
    },
    [api, market],
  )

function CreateLoanTab({ market, api, rChainId }: CreateLoanProps) {
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  return (
    <CreateLoanForm
      networks={networks}
      chainId={rChainId}
      market={market}
      onUpdate={useOnFormUpdate({ market, api })}
      onCreated={useCallback(
        async () => api && market && (await onLoanCreated(api, market)),
        [api, market, onLoanCreated],
      )}
    />
  )
}

export const LendCreateTabsNewMenu = [
  { value: 'create', label: t`Borrow`, component: CreateLoanTab },
] satisfies FormTab<CreateLoanProps>[]

export const LendCreateTabsOldMenu = [
  { value: 'create', label: t`Create Loan`, component: LoanFormCreate },
  {
    value: 'leverage',
    label: t`Leverage`,
    component: (p) => <LoanFormCreate {...p} isLeverage />,
    visible: ({ market }) => market && hasLeverage(market),
  },
] satisfies FormTab<CreateLoanProps>[]

const LoanCreate = (pageProps: CreateLoanProps) => {
  const menu = useCreateLoanMuiForm() ? LendCreateTabsNewMenu : LendCreateTabsOldMenu
  return (
    <FormTabs<CreateLoanProps>
      params={pageProps}
      menu={menu}
      shouldWrap={menu === LendCreateTabsOldMenu}
      defaultTab={pageProps.rFormType}
    />
  )
}

export default LoanCreate
