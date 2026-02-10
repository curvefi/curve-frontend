import { t } from '@ui-kit/lib/i18n'
import { LlamaMarketType } from '@ui-kit/types/market'

export const MarketTypeSuffix: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`(Lending Markets)`,
  [LlamaMarketType.Mint]: t`(Mint Markets)`,
}
