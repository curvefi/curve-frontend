import { DeprecatedMarket } from '@/llamalend/queries/market-list/constants'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'

export const DeprecatedMarketBanner = ({ message, url }: DeprecatedMarket) => (
  <Banner severity="warning" subtitle={message} learnMoreUrl={url}>
    {t`This market is deprecated`}
  </Banner>
)
