import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { LoanTabProps } from '@/loan/components/PageMintMarket/types'
import { networks } from '@/loan/networks'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import { FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

const menu = [
  {
    value: 'create',
    label: t`Borrow`,
    component: ({ market, rChainId, onPricesUpdated, apiMarket }: LoanTabProps) => (
      <CreateLoanForm
        networks={networks}
        chainId={rChainId}
        market={market}
        onPricesUpdated={onPricesUpdated}
        apiMarket={apiMarket}
        marketType={LlamaMarketType.Mint}
      />
    ),
  },
] satisfies FormTab<LoanTabProps>[]

export const CreateLoanTabs = (props: LoanTabProps) => <FormTabs params={props} menu={menu} />
