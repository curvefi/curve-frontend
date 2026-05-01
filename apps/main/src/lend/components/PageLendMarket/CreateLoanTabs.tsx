import { networks } from '@/lend/networks'
import { type MarketUrlParams, type PageContentProps } from '@/lend/types/lend.types'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { getControllerAddress } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'

type CreateLoanProps = PageContentProps<MarketUrlParams> & {
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}

function CreateLoanTab({ market, rChainId, onPricesUpdated }: CreateLoanProps) {
  const marketAlert = useMarketAlert(rChainId, getControllerAddress(market), LlamaMarketType.Lend)
  return (
    <CreateLoanForm
      networks={networks}
      chainId={rChainId}
      market={market}
      onPricesUpdated={onPricesUpdated}
      borrowDisabledAlert={marketAlert?.isBorrowDisabled && marketAlert}
    />
  )
}

const menu = [{ value: 'create', label: t`Borrow`, component: CreateLoanTab }] satisfies FormTab<CreateLoanProps>[]

export const CreateLoanTabs = (pageProps: CreateLoanProps) => <FormTabs params={pageProps} menu={menu} />
