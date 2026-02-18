import { useCallback } from 'react'
import { LoanCreateForm } from '@/lend/components/PageLendMarket/LoanFormCreate/LoanCreateForm'
import type { FormValues } from '@/lend/components/PageLendMarket/types'
import { DEFAULT_CREATE_FORM_STATUS } from '@/lend/components/PageLendMarket/utils'
import { networks } from '@/lend/networks'
import { _getActiveKey } from '@/lend/store/createLoanCreateSlice'
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
  const [setStateByKeys] = useDebounced(
    useStore((store) => store.loanCreate.setStateByKeys),
    Duration.FormDebounce,
  )
  return useCallback(
    async (
      { debt, userCollateral, range, slippage, leverageEnabled, userBorrowed, maxDebt, maxCollateral },
      { isApproved = false }, // maxLeverage, estimatedGas },
    ) => {
      const formValues: FormValues = {
        n: range,
        debt: `${debt ?? ''}`,
        userBorrowed: `${userBorrowed ?? ''}`,
        userCollateral: `${userCollateral ?? ''}`,
        userCollateralError: '',
        userBorrowedError: '',
        debtError: '',
      }

      const activeKeys = _getActiveKey(api, market, formValues, slippage)
      setStateByKeys({
        ...activeKeys,
        formValues,
        formStatus: {
          ...DEFAULT_CREATE_FORM_STATUS,
          isApproved,
          isApprovedCompleted: isApproved,
        },
        isEditLiqRange: true,
        // maxLeverage: { [range]: maxLeverage ?? '' },
        // maxRecv: { [activeKeys.activeKey]: maxCollateral ?? '' },
        maxLeverage: {},
        maxRecv: {},
        detailInfoLeverage: {},
        detailInfo: {},
        formEstGas: {},
        liqRanges: {},
        liqRangesMapper: {},
      })
    },
    [api, market, setStateByKeys],
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
    <CreateLoanForm networks={networks} chainId={rChainId} market={market} onUpdate={onUpdate} onCreated={onCreated} />
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
