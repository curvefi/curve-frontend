import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon, type Size } from './TokenIcon'
import { applySxProps, SxProps } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

type TokenInfoBaseProps = {
  iconPosition: 'left' | 'right'
  primary: ReactNode
  secondary?: ReactNode
  boldPrimary?: boolean
}

export type TokenInfoTokenIconProps = TokenInfoBaseProps & {
  address: string
  blockchainId: string
  showChainIcon?: boolean
  iconSize?: Size
  icon?: never
  sx?: SxProps
}

type TokenInfoCustomIconProps = TokenInfoBaseProps & {
  icon: ReactNode
  address?: never
  blockchainId?: never
  showChainIcon?: never
  iconSize?: never
  sx?: SxProps
}

export type TokenInfoProps = TokenInfoTokenIconProps | TokenInfoCustomIconProps

export const TokenInfo = (props: TokenInfoProps) => {
  const { iconPosition, primary, secondary, boldPrimary } = props
  const tokenIcon =
    'address' in props ? (
      <TokenIcon
        blockchainId={props.blockchainId}
        address={props.address}
        size={props.iconSize ?? 'lg'}
        showChainIcon={props.showChainIcon}
      />
    ) : (
      props.icon
    )

  return (
    <Stack direction="row" sx={applySxProps({ gap: Spacing.xs, alignItems: 'center' }, props.sx)}>
      {iconPosition === 'left' && tokenIcon}

      <Stack sx={{ gap: Spacing.xxs, alignItems: iconPosition === 'right' ? 'end' : 'start' }}>
        <Typography variant={boldPrimary ? 'tableCellMBold' : 'tableCellMRegular'} noWrap>
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
