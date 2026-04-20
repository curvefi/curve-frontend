import { DeprecatedMarketAlert } from '@/llamalend/llama-markets.constants'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'

export const DeprecatedMarketBanner = ({ message, url }: DeprecatedMarketAlert) => (
  <Banner severity="warning" subtitle={message} learnMoreUrl={url}>
    {t`Deprecated market`}
  </Banner>
)
