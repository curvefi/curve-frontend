import { t } from '@evm-ui/lib/i18n'
import { SelectableChip } from '@evm-ui/shared/ui/SelectableChip'
import { TokenIcon } from '@evm-ui/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TokenOption } from '../../types'

const { Spacing } = SizesAndSpaces

type FavoriteTokenCallbacks<T extends TokenOption> = {
  onToken: (token: T) => void
}

type FavoriteTokenProps<T extends TokenOption> = {
  tokens: T[]
}

type Props<T extends TokenOption> = FavoriteTokenCallbacks<T> & FavoriteTokenProps<T>

export const FavoriteTokens = <T extends TokenOption>({ tokens, onToken }: Props<T>) => (
  <Stack sx={{ gap: Spacing.xs, paddingBlock: Spacing.xs }}>
    <Typography variant="headingXsBold">{t`Favorite tokens`}</Typography>

    <Stack direction="row" sx={{ gap: Spacing.xs, flexWrap: 'wrap' }}>
      {tokens.map(
        (
          token, // todo: handle the selected token case
        ) => (
          <SelectableChip
            key={token.address}
            icon={<TokenIcon blockchainId={token.chain} tooltip={token.symbol} address={token.address} size="mui-md" />}
            label={token.symbol}
            toggle={() => onToken(token)}
            selected={false}
          />
        ),
      )}
    </Stack>
  </Stack>
)
