import { formatNumber } from '@primitives/number.utils'
import { IconStack } from '@ui/components/IconStack'
import { InlineTableCell } from '@ui/components/InlineTableCell'
import { TokenIcon } from '@ui/components/TokenIcon'
import { TokenInfo } from '@ui/components/TokenInfo'
import type { ActivityTokenDelta } from '../types'

/** Shows the amount of a single token delta, or the stacked token icons when there are multiple deltas */
export const TokenDeltaAmountCell = ({ deltas }: { deltas: readonly ActivityTokenDelta[] }) => {
  const [first] = deltas
  return (
    <InlineTableCell sx={{ alignItems: 'end' }}>
      {deltas.length > 1 ? (
        <IconStack iconSize="md">
          {deltas.map(({ label, token, blockchainId }) => (
            <TokenIcon
              key={label}
              blockchainId={blockchainId}
              address={token?.address}
              tooltip={token?.symbol}
              size="mui-md"
            />
          ))}
        </IconStack>
      ) : (
        first?.token && (
          <TokenInfo
            address={first.token.address}
            blockchainId={first.blockchainId}
            iconPosition="right"
            iconSize="mui-md"
            primary={formatNumber(first.amount, 'token.amount')}
          />
        )
      )}
    </InlineTableCell>
  )
}
