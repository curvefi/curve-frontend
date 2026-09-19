import type { ReactNode } from 'react'
import { PageHeader } from '@ui/components/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'

const ICON_SIZE = 35

type PoolToken = { symbol: string; address: string }

/** Shared pool-page heading. Apps supply resolved display data and optional right-side content. */
export const PoolDetailsHeader = ({
  title,
  tokens,
  blockchainId,
  isLoading,
  backHref,
  rightItems,
}: {
  title: string | undefined
  tokens: PoolToken[] | undefined
  blockchainId: string
  isLoading: boolean
  backHref: string | undefined
  rightItems: ReactNode | undefined
}) => (
  <PageHeader
    backHref={backHref}
    title={title ?? 'Pool'}
    titleLoading={isLoading}
    subtitle={tokens?.map(({ symbol }) => symbol).join(' / ') ?? (isLoading ? 'Token symbols' : undefined)}
    subtitleLoading={isLoading}
    icon={
      (isLoading || (tokens && tokens.length > 0)) && (
        <WithSkeleton loading={isLoading} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
          <TokenIcons blockchainId={blockchainId} tokens={tokens} overflowMode="stack" />
        </WithSkeleton>
      )
    }
    rightItems={rightItems}
  />
)
