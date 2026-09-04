import { networks } from '@/lend/networks'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { t } from '@evm-ui/lib/i18n'
import { type FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import type { Decimal } from '@primitives/decimal.utils'
import type { Range } from '@ui/features/queries/util'

type CreateLoanTabsParams = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

const menu = [
  { value: 'create', label: t`Borrow`, component: props => <CreateLoanForm networks={networks} {...props} /> },
] satisfies FormTab<CreateLoanTabsParams>[]

export const CreateLoanTabs = (pageProps: CreateLoanTabsParams) => <FormTabs params={pageProps} menu={menu} />
