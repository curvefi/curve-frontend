import { enforce, group, test } from 'vest'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { FieldsOf } from '@ui-kit/lib'
import type { MarketParams, MarketQuery } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { marketIdValidationGroup } from '@ui-kit/lib/model/query/market-id-validation'

const marketValidationGroup = ({ marketId }: Pick<MarketParams, 'marketId'>) =>
  group('marketValidationGroup', () => {
    marketId &&
      test('marketId', 'Should be found', () => {
        enforce(getLlamaMarket(marketId!)).isNotNullish()
      })
  })

export function llamaMarketValidationGroup({ chainId, marketId }: FieldsOf<MarketQuery>) {
  chainValidationGroup({ chainId })
  llamaApiValidationGroup({ chainId })
  marketIdValidationGroup({ marketId })
  marketValidationGroup({ marketId })
}
