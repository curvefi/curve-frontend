import { CURVE_SOCIALS } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'

type Props = { resetFilters: () => void; isError: boolean }

export const PoolListEmptyState = ({ resetFilters, isError }: Props) =>
  isError ? (
    <EmptyStateCard title={t`Unable to retrieve pool list.`} description={t`Please try again later.`} />
  ) : (
    <EmptyStateCard
      title={t`Can't find what you're looking for?`}
      description={t`Feel free to ask us on Telegram`}
      button={{ label: t`Telegram`, href: CURVE_SOCIALS.telegram.en }}
      secondaryButton={{ label: t`Show all pools`, onClick: resetFilters }}
    />
  )
