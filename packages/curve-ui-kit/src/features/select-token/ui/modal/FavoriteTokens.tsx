import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TokenOption } from '../../types'

const { Spacing } = SizesAndSpaces

export type FavoriteTokenCallbacks<T extends TokenOption> = {
  onToken: (token: T) => void
}

export type FavoriteTokenProps<T extends TokenOption> = {
  tokens: T[]
}

export type Props<T extends TokenOption> = FavoriteTokenCallbacks<T> & FavoriteTokenProps<T>

export const FavoriteTokens = <T extends TokenOption>({ tokens, onToken }: Props<T>) => (
  <Stack gap={Spacing.xs} sx={{ paddingBlock: Spacing.xs }}>
    <Typography variant="headingXsBold">{t`Favorite tokens`}</Typography>

    <Stack direction="row" gap={Spacing.xs} flexWrap="wrap">
      {tokens.map((token) => (
        <Chip
          key={token.address}
          size="small"
          icon={<TokenIcon blockchainId={token.chain} tooltip={token.symbol} address={token.address} size="mui-md" />}
          clickable={true}
          label={token.symbol}
          onClick={() => onToken(token)}
        />
      ))}
    </Stack>
  </Stack>
)
