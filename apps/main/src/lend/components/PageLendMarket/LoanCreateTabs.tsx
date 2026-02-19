import { useCallback } from 'react'
import { LoanCreateForm } from '@/lend/components/PageLendMarket/LoanFormCreate/LoanCreateForm'
import { networks } from '@/lend/networks'
import { useStore } from '@/lend/store/useStore'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { hasLeverage } from '@/llamalend/llama.utils'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import type { Range } from '@ui-kit/types/util'
import type { Decimal } from '@ui-kit/utils'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanProps = PageContentProps<MarketUrlParams> & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

function CreateLoanTab({ market, api, rChainId, onPricesUpdated }: CreateLoanProps) {
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  const onCreated = useCallback(
    async () => api && market && (await onLoanCreated(api, market)),
    [api, market, onLoanCreated],
  )
  return (
    <CreateLoanForm
      networks={networks}
      chainId={rChainId}
      market={market}
      onPricesUpdated={onPricesUpdated}
      onSuccess={onCreated}
    />
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
