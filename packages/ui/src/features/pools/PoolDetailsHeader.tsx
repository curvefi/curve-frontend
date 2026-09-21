import type { ReactNode } from 'react'
import { PageHeader } from '@ui/components/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'

const ICON_SIZE = 35

/** Shared pool-page heading. Apps supply resolved display data and optional right-side content. */
export const PoolDetailsHeader = ({
  title: { data: title, isLoading: isTitleLoading },
  tokens: { data: tokens, isLoading: isLoadingTokens },
  blockchainId,
  backHref,
  rightItems,
}: {
  title: QueryProp<string>
  tokens: QueryProp<{ symbol: string; address: string }[]>
  blockchainId: string
  backHref: string
  rightItems: ReactNode
}) => (
  <PageHeader
    backHref={backHref}
    title={title ?? 'Pool'}
    titleLoading={isTitleLoading}
    subtitle={tokens?.map(({ symbol }) => symbol).join(' / ') ?? (isLoadingTokens ? 'Token symbols' : undefined)}
    subtitleLoading={isLoadingTokens}
    icon={
      (isLoadingTokens || (tokens && tokens.length > 0)) && (
        <WithSkeleton loading={isLoadingTokens} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
          <TokenIcons blockchainId={blockchainId} tokens={tokens} overflowMode="stack" />
        </WithSkeleton>
      )
    }
    rightItems={rightItems}
  />
)
