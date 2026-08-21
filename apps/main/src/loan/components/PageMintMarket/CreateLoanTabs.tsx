import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { networks } from '@/loan/networks'
import { t } from '@evm-ui/lib/i18n'
import type { Range } from '@evm-ui/types/util'
import { FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import type { Decimal } from '@primitives/decimal.utils'

type CreateLoanTabsParams = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

const menu = [
  { value: 'create', label: t`Borrow`, component: props => <CreateLoanForm networks={networks} {...props} /> },
] satisfies FormTab<CreateLoanTabsParams>[]

export const CreateLoanTabs = (props: CreateLoanTabsParams) => <FormTabs params={props} menu={menu} />
