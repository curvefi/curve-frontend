import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { PLACEHOLDER, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { type QueryOrValue, type QueryProp, toQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { applySxProps, SxProps } from '@ui/lib/mui'
import { ErrorIconButton } from './ErrorIconButton'
import { Spinner } from './Spinner'
import { TokenIcon, type Size, type TokenPairAddresses } from './TokenIcon'
import { WithSkeleton } from './WithSkeleton'

const { Spacing } = SizesAndSpaces

type TokenInfoBaseProps = {
  iconPosition: 'left' | 'right'
  iconAlignment?: 'start' | 'center' | 'end'
  primary: QueryOrValue<ReactNode>
  secondary?: QueryOrValue<ReactNode>
  boldPrimary?: boolean
}

export type TokenInfoTokenIconProps = TokenInfoBaseProps & {
  address: Address | TokenPairAddresses
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

const TokenInfoItem = ({
  value: { data, error, isLoading },
  ...typographyProps
}: { value: QueryProp<ReactNode> } & Pick<TypographyProps, 'variant' | 'color'>) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xxs }}>
    {error && <ErrorIconButton error={error} size="extraSmall" />}
    {isLoading && data != null && <Spinner size={16} sx={{ margin: 0 }} />}
    <WithSkeleton loading={isLoading && data == null}>
      <Typography {...typographyProps} noWrap>
        {data ?? (isLoading ? PLACEHOLDER : !error && UNAVAILABLE_NOTATION)}
      </Typography>
    </WithSkeleton>
  </Stack>
)

export const TokenInfo = (props: TokenInfoProps) => {
  const { iconPosition, iconAlignment = 'center', primary, secondary, boldPrimary } = props
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
    <Stack direction="row" sx={applySxProps({ gap: Spacing.xs, alignItems: iconAlignment }, props.sx)}>
      {iconPosition === 'left' && tokenIcon}

      <Stack sx={{ gap: Spacing.xxs, alignItems: iconPosition === 'right' ? 'end' : 'start' }}>
        <TokenInfoItem value={toQuery(primary)} variant={boldPrimary ? 'tableCellValueStrong' : 'tableCellValue'} />

        {secondary && <TokenInfoItem value={toQuery(secondary)} variant="tableCellSupport" color="textSecondary" />}
      </Stack>

      {iconPosition === 'right' && tokenIcon}
    </Stack>
  )
}
