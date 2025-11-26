import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'

export const MarketMisc = ({ market }: { market: LlamaMarketTemplate }) => (
  <ActionInfo label={t`Id`} value={market?.id} loading={!market} />
)
