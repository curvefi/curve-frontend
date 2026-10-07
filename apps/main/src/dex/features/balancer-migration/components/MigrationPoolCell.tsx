import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TokenIconsProps } from '@ui/components/TokenIcons'
import { responsiveTitleEllipsisSx } from '@ui/features/tables/titleTruncate'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import type { MigrationProtocol } from '../migration.utils'
import { ProtocolPoolIcons } from './ProtocolPoolIcons'

const { Spacing, Height } = SizesAndSpaces

/** Two tables share the content column on desktop; long Balancer names would push the numbers out of view. */
const NAME_MAX_WIDTH = '14rem'

/** Pool title layout of the DEX pool list, without the link: a click on the row selects the pool. */
export const MigrationPoolCell = ({
  blockchainId,
  tokens,
  protocol,
  name,
  badges,
}: Pick<TokenIconsProps, 'blockchainId' | 'tokens'> & {
  protocol: MigrationProtocol
  name: string
  badges: ReactNode
}) => (
  <Stack direction="row" sx={{ height: Height.row, alignItems: 'center', gap: Spacing.sm }}>
    <ProtocolPoolIcons blockchainId={blockchainId} tokens={tokens} protocol={protocol} />
    <Stack sx={{ justifyContent: 'center', gap: Spacing.xxs, minWidth: 0 }}>
      <Typography
        variant="tableCellL"
        sx={{ ...responsiveTitleEllipsisSx, maxWidth: { mobile: 'calc(100vw - 200px)', desktop: NAME_MAX_WIDTH } }}
      >
        {name}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
        {badges}
      </Stack>
    </Stack>
  </Stack>
)
