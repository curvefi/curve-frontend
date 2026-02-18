import { useCallback } from 'react'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { hasV1Leverage } from '@/llamalend/llama.utils'
import type { CreateLoanMutation, CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import { LoanFormCreate } from '@/loan/components/PageMintMarket/LoanFormCreate'
import type { PageLoanCreateProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { useCreateLoanMuiForm } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type MintCreateTabsProps = PageLoanCreateProps & {
  onChartPreviewPricesUpdate?: (prices: string[] | null) => void
}

function CreateLoanTab({ market, curve, rChainId, onChartPreviewPricesUpdate }: MintCreateTabsProps) {
  const onLoanCreated = useStore((state) => state.loanCreate.onLoanCreated)
  const onCreated: NonNullable<CreateLoanOptions['onCreated']> = useCallback(
    async (_data, _receipt, { slippage, leverageEnabled }: CreateLoanMutation) =>
      curve && market && (await onLoanCreated(curve, leverageEnabled, market, slippage)),
    [curve, market, onLoanCreated],
  )

  const onUpdate: OnCreateLoanFormUpdate = useCallback(
    (prices) => onChartPreviewPricesUpdate?.(prices.data ?? null),
    [onChartPreviewPricesUpdate],
  )
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

const MintCreateTabsNewMenu = [
  { value: 'create', label: t`Borrow`, component: CreateLoanTab },
] satisfies FormTab<MintCreateTabsProps>[]

const MintCreateTabsOldMenu = [
  { value: 'create', label: t`Create Loan`, component: LoanFormCreate },
  {
    value: 'leverage',
    label: t`Leverage`,
    component: (p) => <LoanFormCreate {...p} isLeverage />,
    visible: ({ market }) => market && hasV1Leverage(market),
  },
] satisfies FormTab<PageLoanCreateProps>[]

export const CreateLoanTabs = (props: MintCreateTabsProps) => {
  const menu = useCreateLoanMuiForm() ? MintCreateTabsNewMenu : MintCreateTabsOldMenu
  const shouldWrap = menu === MintCreateTabsOldMenu
  return <FormTabs params={props} menu={menu} shouldWrap={shouldWrap} />
}
