import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TokenIcons, type TokenIconsProps } from '@ui/components/TokenIcons'
import { responsiveTitleEllipsisSx } from '@ui/features/tables/titleTruncate'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { Spacing, Height } = SizesAndSpaces

/** Pool title layout of the DEX pool list, without the link: a click on the row selects the pool. */
export const MigrationPoolCell = ({
  blockchainId,
  tokens,
  name,
  badges,
}: Pick<TokenIconsProps, 'blockchainId' | 'tokens'> & { name: string; badges: ReactNode }) => (
  <Stack direction="row" sx={{ height: Height.row, alignItems: 'center', gap: Spacing.sm }}>
    <TokenIcons blockchainId={blockchainId} tokens={tokens} showTooltips={false} />
    <Stack sx={{ justifyContent: 'center', gap: Spacing.xxs }}>
      <Typography variant="tableCellL" sx={responsiveTitleEllipsisSx}>
        {name}
      </Typography>
      <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xs }}>
        {badges}
      </Stack>
    </Stack>
  </Stack>
)
