import { networks } from '@/lend/networks'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import type { Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanTabsProps = {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

const menu = [
  { value: 'create', label: t`Borrow`, component: props => <CreateLoanForm networks={networks} {...props} /> },
] satisfies FormTab<CreateLoanTabsProps>[]

export const CreateLoanTabs = (pageProps: CreateLoanTabsProps) => <FormTabs params={pageProps} menu={menu} />
