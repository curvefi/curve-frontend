import { useCallback } from 'react'
import { LoanCreateForm } from '@/lend/components/PageLendMarket/LoanFormCreate/LoanCreateForm'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { hasLeverage } from '@/llamalend/llama.utils'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanProps = PageContentProps<MarketUrlParams> & {
  onChartPreviewPricesUpdate?: (prices: string[] | null) => void
}

function CreateLoanTab({ market, api, rChainId, onChartPreviewPricesUpdate }: CreateLoanProps) {
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  const onCreated = useCallback(
    async () => api && market && (await onLoanCreated(api, market)),
    [api, market, onLoanCreated],
  )
  const onUpdate: OnCreateLoanFormUpdate = useCallback(
    (prices) => onChartPreviewPricesUpdate?.(prices.data ?? null),
    [onChartPreviewPricesUpdate],
  )
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
