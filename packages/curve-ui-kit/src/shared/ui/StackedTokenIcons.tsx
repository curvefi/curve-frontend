import { DEFAULT_OVERLAP, StackedIcons, type StackedIconSize } from './StackedIcons'
import { TokenIcon, type TokenIconProps } from './TokenIcon'

type Token = {
  symbol: string
  address: string
}

export type StackedTokenIconsProps = {
  blockchainId: string
  tokens: readonly Token[]
  size?: TokenIconProps['size']
  /** Percentage of the TokenIcon's width to overlap */
  overlap?: number
}

const STACK_SIZE_BY_TOKEN_SIZE = {
  xs: 'xs',
  'mui-sm': 'sm',
  'mui-md': 'md',
  sm: 'lg',
  lg: 'lg',
  xl: 'xl',
} as const satisfies Record<NonNullable<TokenIconProps['size']>, StackedIconSize>

export const StackedTokenIcons = ({
  blockchainId,
  tokens,
  size = 'sm',
  overlap = DEFAULT_OVERLAP,
}: StackedTokenIconsProps) => (
  <StackedIcons
    items={tokens}
    getKey={({ address, symbol }, index) => `${address}-${symbol}-${index}`}
    renderIcon={({ address, symbol }) => (
      <TokenIcon blockchainId={blockchainId} address={address} tooltip={symbol} size={size} />
    )}
    size={STACK_SIZE_BY_TOKEN_SIZE[size]}
    overlap={overlap}
  />
)
