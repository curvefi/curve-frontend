import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { networks } from '@/loan/networks'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import type { Range } from '@ui-kit/types/util'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanTabsParams = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

const menu = [
  { value: 'create', label: t`Borrow`, component: props => <CreateLoanForm networks={networks} {...props} /> },
] satisfies FormTab<CreateLoanTabsParams>[]

export const CreateLoanTabs = (props: CreateLoanTabsParams) => <FormTabs params={props} menu={menu} />
