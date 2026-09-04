import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { PageHeader } from '@evm-ui/widgets/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { t } from '@ui/lib/i18n'
import { PoolMetricsRow } from './PoolMetricsRow'

const ICON_SIZE = 35

export const PoolPageHeader = ({
  chainId,
  blockchainId,
  poolIdOrAddress,
  title,
  tokenList,
  isLoading,
  pricesApiPoolData,
  backHref,
}: {
  chainId: number
  blockchainId: string
  poolIdOrAddress: string
  title: string | undefined
  tokenList: { symbol: string; address: string }[] | undefined
  isLoading: boolean
  pricesApiPoolData: PricesApiPool | undefined
  backHref?: string
}) => {
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })

  return (
    <PageHeader
      backHref={backHref}
      title={title ?? 'Pool'}
      titleLoading={isLoading}
      subtitle={tokenList?.map(({ symbol }) => symbol).join(' / ') ?? (isLoading ? t`Token symbols` : undefined)}
      subtitleLoading={isLoading}
      icon={
        (isLoading || (tokenList && tokenList.length > 0)) && (
          <WithSkeleton loading={isLoading} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
            <TokenIcons blockchainId={blockchainId} tokens={tokenList ?? []} overflowMode="stack" />
          </WithSkeleton>
        )
      }
      rightItems={poolId && <PoolMetricsRow chainId={chainId} poolId={poolId} pricesApiPoolData={pricesApiPoolData} />}
    />
  )
}
