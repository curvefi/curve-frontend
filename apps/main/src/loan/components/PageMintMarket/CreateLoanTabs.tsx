import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { LoanTabProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import { t } from '@ui-kit/lib/i18n'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

const menu = [
  {
    value: 'create',
    label: t`Borrow`,
    component: ({ market, rChainId, onPricesUpdated }: LoanTabProps) => (
      <CreateLoanForm networks={networks} chainId={rChainId} market={market} onPricesUpdated={onPricesUpdated} />
    ),
  },
] satisfies FormTab<LoanTabProps>[]

export const CreateLoanTabs = (props: LoanTabProps) => <FormTabs params={props} menu={menu} />
