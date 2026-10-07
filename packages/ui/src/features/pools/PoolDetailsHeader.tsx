import type { ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import { completeArray } from '@primitives/array.utils'
import { PageHeader } from '@ui/components/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { aggregateQueries } from '@ui/features/queries/combine'
import type { QueryProp } from '@ui/features/queries/util'

const ICON_SIZE = 35

/** Shared pool-page heading. Apps supply resolved display data and optional right-side content. */
export const PoolDetailsHeader = ({
  title: { data: title, isLoading: isTitleLoading },
  tokens,
  blockchainId,
  backHref,
  rightItems,
}: {
  title: QueryProp<string>
  tokens: QueryProp<{ symbol: string | undefined; address: Address }>[] | undefined
  blockchainId: string
  backHref: string
  rightItems: ReactNode
}) => {
  const tokenQuery = tokens && aggregateQueries(tokens)
  const tokenData = completeArray(tokenQuery?.data)
  const isLoadingTokens = tokenQuery?.isLoading ?? true

  return (
    <PageHeader
      backHref={backHref}
      title={title ?? 'Pool'}
      titleLoading={isTitleLoading}
      subtitle={tokenData?.map(({ symbol }) => symbol).join(' / ') ?? (isLoadingTokens ? 'Token symbols' : undefined)}
      subtitleLoading={isLoadingTokens}
      icon={
        (isLoadingTokens || (tokenData && tokenData.length > 0)) && (
          <WithSkeleton loading={isLoadingTokens} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
            <TokenIcons blockchainId={blockchainId} tokens={tokenData} overflowMode="stack" />
          </WithSkeleton>
        )
      }
      rightItems={rightItems}
    />
  )
}
