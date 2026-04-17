import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { PageLoanCreateProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import type { Range } from '@ui-kit/types/util'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type MintCreateTabsProps = PageLoanCreateProps & { onPricesUpdated: (prices: Range<Decimal> | undefined) => void }

const menu = [
  {
    value: 'create',
    label: t`Borrow`,
    component: ({ market, rChainId, onPricesUpdated }: MintCreateTabsProps) => (
      <CreateLoanForm
        networks={networks}
        chainId={rChainId}
        market={market ?? undefined}
        onPricesUpdated={onPricesUpdated}
      />
    ),
  },
] satisfies FormTab<MintCreateTabsProps>[]

export const CreateLoanTabs = (props: MintCreateTabsProps) => <FormTabs params={props} menu={menu} />
