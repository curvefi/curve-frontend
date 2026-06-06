import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon } from './TokenIcon'

const { Spacing } = SizesAndSpaces

type TokenInfoBaseProps = {
  iconPosition: 'left' | 'right'
  primary: ReactNode
  secondary?: ReactNode
}

export type TokenInfoTokenIconProps = TokenInfoBaseProps & {
  address: string
  blockchainId: string
  showChainIcon?: boolean
  icon?: never
}

export type TokenInfoCustomIconProps = TokenInfoBaseProps & {
  icon: ReactNode
  address?: never
  blockchainId?: never
  showChainIcon?: never
}

export type TokenInfoProps = TokenInfoTokenIconProps | TokenInfoCustomIconProps

export const TokenInfo = (props: TokenInfoProps) => {
  const { iconPosition, primary, secondary } = props
  const tokenIcon =
    'address' in props ? (
      <TokenIcon
        blockchainId={props.blockchainId}
        address={props.address}
        size="lg"
        showChainIcon={props.showChainIcon}
      />
    ) : (
      props.icon
    )

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
