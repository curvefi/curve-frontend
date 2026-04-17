import type { ReactNode } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'

export const DeprecatedMarketBanner = ({ message }: { message?: ReactNode }) => (
  <Banner severity="warning" subtitle={message}>
    {t`This market is deprecated`}
  </Banner>
)
