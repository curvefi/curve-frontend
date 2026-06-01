import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon } from './TokenIcon'

const { Spacing } = SizesAndSpaces

export const TokenInfo = ({
  address,
  blockchainId,
  iconPosition,
  primary,
  secondary,
  showChainIcon,
}: {
  address: string
  blockchainId: string
  iconPosition: 'left' | 'right'
  primary: string
  secondary?: string
  showChainIcon?: boolean
}) => {
  const tokenIcon = <TokenIcon blockchainId={blockchainId} address={address} size="lg" showChainIcon={showChainIcon} />

  return (
    <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
      {iconPosition === 'left' && tokenIcon}

      <Stack sx={{ gap: Spacing.xxs, alignItems: iconPosition === 'right' ? 'end' : 'start' }}>
        <Typography variant="tableCellMBold" noWrap>
          {primary}
        </Typography>

        {secondary && (
          <Typography variant="tableCellSRegular" color="textSecondary" noWrap>
            {secondary}
          </Typography>
        )}
      </Stack>

      {iconPosition === 'right' && tokenIcon}
    </Stack>
  )
}
