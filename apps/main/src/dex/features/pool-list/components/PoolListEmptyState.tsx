import { useConnection } from 'wagmi'
import { useChainId } from '@/dex/hooks/useChainId'
import { useUserPools } from '@/dex/queries/user-pools.query'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { CURVE_SOCIALS } from '@ui/utils'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { EmptyStateCard } from '@ui-kit/shared/ui/EmptyStateCard'

type Props = {
  resetFilters: () => void
}

export const PoolListEmptyState = ({ resetFilters }: Props) => {
  const props = useParams<NetworkUrlParams>()
  const chainId = useChainId(props.network)
  const { address: userAddress } = useConnection()
  const { error: userPoolsError, isLoading } = useUserPools({ chainId, userAddress })

  return userPoolsError ? (
    <EmptyStateCard title={t`Unable to retrieve pool list.`} description={userPoolsError.message} />
  ) : (
    <EmptyStateCard
      title={t`Can't find what you're looking for?`}
      description={t`Feel free to ask us on Telegram`}
      button={{ label: t`Telegram`, href: CURVE_SOCIALS.telegram.en }}
      secondaryButton={{ label: t`Show all pools`, onClick: resetFilters }}
      isLoading={isLoading}
    />
  )
}
