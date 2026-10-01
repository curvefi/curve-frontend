import { networks } from '@/lend/networks'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { BorrowTabsClaimVisibility } from '@/llamalend/features/borrow/types'
import type { Decimal } from '@primitives/decimal.utils'
import { type FormTab, FormTabs } from '@ui/features/forms/tabs/FormTabs'
import type { Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { borrowClaimTab } from './borrow-claim-tab'

type CreateLoanTabsParams = BorrowTabsClaimVisibility & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

const menu = [
  { value: 'create', label: t`Borrow`, component: props => <CreateLoanForm networks={networks} {...props} /> },
  borrowClaimTab,
] satisfies FormTab<CreateLoanTabsParams>[]

export const CreateLoanTabs = (pageProps: CreateLoanTabsParams) => <FormTabs params={pageProps} menu={menu} />
