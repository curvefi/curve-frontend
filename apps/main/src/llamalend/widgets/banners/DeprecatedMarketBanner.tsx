import { DeprecatedMarketAlert } from '@/llamalend/markets.constants'
import { Banner } from '@evm-ui/shared/ui/Banner'
import { t } from '@ui/lib/i18n'

export const DeprecatedMarketBanner = ({ message, url }: DeprecatedMarketAlert) => (
  <Banner severity="warning" subtitle={message} learnMoreUrl={url}>
    {t`Deprecated market`}
  </Banner>
)
