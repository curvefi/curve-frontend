import Box from '@mui/material/Box'
import { BadgeIcon } from '@ui/components/BadgeIcon'
import { TokenBadge } from '@ui/components/TokenBadge'
import { TokenIcons, type TokenIconsProps } from '@ui/components/TokenIcons'
import { type MigrationProtocol, PROTOCOLS } from '../migration.utils'

/** Pool tokens with the protocol logo where the chain icon usually sits, so source and target LP are told apart. */
export const ProtocolPoolIcons = ({
  blockchainId,
  tokens,
  protocol,
}: Pick<TokenIconsProps, 'blockchainId' | 'tokens'> & { protocol: MigrationProtocol }) => (
  // flexShrink keeps the fixed-size icon group intact inside shrinking rows
  <Box sx={{ position: 'relative', flexShrink: 0 }}>
    <TokenIcons blockchainId={blockchainId} tokens={tokens} showTooltips={false} />
    <TokenBadge tooltipTitle={PROTOCOLS[protocol].name} position="br">
      {/* The tooltip names the protocol, so a missing logo shows nothing rather than its alt text. */}
      <BadgeIcon src={PROTOCOLS[protocol].logoUrl} alt="" />
    </TokenBadge>
  </Box>
)
