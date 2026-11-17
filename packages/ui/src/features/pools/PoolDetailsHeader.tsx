import type { ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import { PageHeader } from '@ui/components/PageHeader'
import { TokenIcons } from '@ui/components/TokenIcons'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'

const ICON_SIZE = 35

/** Shared pool-page heading. Apps supply title and token queries and optional right-side content. */
export const PoolDetailsHeader = ({
  title,
  tokens,
  blockchainId,
  backHref,
  rightItems,
}: {
  title: QueryProp<string>
  tokens: QueryProp<{ symbol: string | undefined; address: Address }[]>
  blockchainId: string
  backHref: string
  rightItems: ReactNode
}) => (
  <PageHeader
    backHref={backHref}
    title={title}
    subtitle={mapQuery(tokens, tokens => tokens.map((t, i) => t.symbol ?? `Token ${i}`).join(' / '))}
    icon={
      <WithSkeleton loading={tokens.isLoading} variant="rectangular" width={ICON_SIZE} height={ICON_SIZE}>
        <TokenIcons blockchainId={blockchainId} tokens={tokens.data} overflowMode="stack" />
      </WithSkeleton>
    }
    rightItems={rightItems}
  />
)
