import { DeprecatedMarketAlert } from '@/llamalend/markets.constants'
import { t } from '@evm-ui/lib/i18n'
import { Banner } from '@evm-ui/shared/ui/Banner'

export const DeprecatedMarketBanner = ({ message, url }: DeprecatedMarketAlert) => (
  <Banner severity="warning" subtitle={message} learnMoreUrl={url}>
    {t`Deprecated market`}
  </Banner>
)
