import { DeprecatedMarketAlert } from '@/llamalend/markets.constants'
import { Banner } from '@ui/features/banners/Banner'
import { t } from '@ui/lib/i18n'

export const DeprecatedMarketBanner = ({ message, url }: DeprecatedMarketAlert) => (
  <Banner severity="warning" subtitle={message} learnMoreUrl={url}>
    {t`Deprecated market`}
  </Banner>
)
