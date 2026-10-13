import type { ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { PageHeader } from '@ui/components/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'
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
}) => (
  <PageHeader
    backHref={backHref}
    title={title ?? 'Pool'}
    titleLoading={isTitleLoading}
    subtitle={tokens?.map((t, i) => t.data?.symbol ?? `Token ${i}`).join(' / ')}
    subtitleLoading={!tokens?.every(t => !t.isLoading)}
    icon={
      <WithSkeleton
        loading={!tokens?.every(t => !t.isLoading)}
        variant="rectangular"
        width={ICON_SIZE}
        height={ICON_SIZE}
      >
        <TokenIcons
          blockchainId={blockchainId}
          tokens={notFalsy(...(tokens ?? []).map(t => t.data))}
          overflowMode="stack"
        />
      </WithSkeleton>
    }
    rightItems={rightItems}
  />
)
