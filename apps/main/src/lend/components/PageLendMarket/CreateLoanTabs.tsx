import { networks } from '@/lend/networks'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import type { Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanProps = PageContentProps<MarketUrlParams> & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

const menu = [
  {
    value: 'create',
    label: t`Borrow`,
    component: ({ market, rChainId, onPricesUpdated }: CreateLoanProps) => (
      <CreateLoanForm networks={networks} chainId={rChainId} market={market} onPricesUpdated={onPricesUpdated} />
    ),
  },
] satisfies FormTab<CreateLoanProps>[]

export const CreateLoanTabs = (pageProps: CreateLoanProps) => <FormTabs params={pageProps} menu={menu} />
