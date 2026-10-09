import type { ComponentProps } from 'react'
import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import { toArray } from '@primitives/array.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { handleBreakpoints } from '@ui/features/themes/basic-theme'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { FallbackIcon } from '@ui/images'
import { applySxProps, type SxProps } from '@ui/lib/mui'
import { getImageBaseUrl } from '@ui/lib/resource.constants'
import { BadgeIcon } from './BadgeIcon'
import { TokenBadge } from './TokenBadge'
import { TokenChainIcon } from './TokenChainIcon'
import { WithWrapper } from './WithWrapper'

const { IconSize } = SizesAndSpaces

// Note: sm size is omitted because it has a custom size
const MAIN_ICON_SIZE = {
  xs: IconSize.xs,
  'mui-sm': IconSize.sm,
  'mui-md': IconSize.md,
  lg: IconSize.lg,
  xl: IconSize.xl,
} as const

const squareSize = <T,>(value: T) => ({ width: value, height: value })

const getTokenImageUrl = (blockchainId: string, address?: string | null) =>
  address ? `${getImageBaseUrl(blockchainId)}${address.toLowerCase()}.png` : FallbackIcon

const TokenImage = ({
  blockchainId,
  address,
  ...props
}: Omit<ComponentProps<'img'>, 'src'> & { blockchainId: string; address?: string | null; sx?: SxProps }) => (
  <Box
    component="img"
    onError={({ currentTarget }) => (currentTarget.src = FallbackIcon)}
    src={getTokenImageUrl(blockchainId, address)}
    loading="lazy"
    {...props}
  />
)

const getTokenIconSizeSx = (
  theme: Theme,
  size: Size, // The original 'sm' size with a 400 breakpoint is a remainder from legacy code.
) =>
  // I didn't want to break the existing interface as it's used everywhere.
  size === 'sm'
    ? { ...squareSize('1.75rem'), [theme.breakpoints.down(400)]: squareSize('1.5rem') }
    : handleBreakpoints(squareSize(MAIN_ICON_SIZE[size]))

// TODO: For another time, we should infer the size type from `keyof typeof IconSize` and generate
// the corresponding size classes programmatically. This component is also used in legacy UI,
// where 'sm' differs from MUI's 'sm'. At the moment of writing this refactor is out of scope.
export type Size = 'sm' | 'mui-sm' | 'mui-md' | 'xs' | 'lg' | 'xl'

export const DEFAULT_SIZE: Size = 'sm'

/** Addresses of two tokens shown as a single icon split in half, e.g. the coins of an LP token */
export type TokenPairAddresses = [string, string]

export type TokenIconProps = {
  /** Additional CSS class name to apply to the token icon */
  className?: string
  /** Blockchain ID used for constructing the image URL */
  blockchainId?: string
  /** Tooltip text to display on hover */
  tooltip?: string
  /** Size variant for the token icon */
  size?: Size
  /** Token contract address used for fetching the icon image, or a token pair to show split in half */
  address?: string | TokenPairAddresses | null
  /** Secondary token contract address used for fetching the badge image */
  badgeAddress?: string | null
  /** Whether the icon should appear disabled (greyed out) */
  disabled?: boolean
  /** Whether the chain icon should be displayed */
  showChainIcon?: boolean
  sx?: SxProps
}

/**
 * Displays a token icon with optional blockchain chain and secondary token badge overlays.
 * Uses WithWrapper to conditionally wrap the icon in a relative-positioned Box only when
 * an overlay is shown, preventing absolute positioning conflicts with other components.
 * When `address` holds a token pair, the icon is split in half between the two tokens.
 */
export const TokenIcon = ({
  className = '',
  blockchainId = '',
  tooltip = '',
  size = DEFAULT_SIZE,
  address,
  badgeAddress,
  disabled,
  showChainIcon = false,
  sx,
}: TokenIconProps) => {
  const iconSx = applySxProps(
    { display: 'block' }, // Not sure why, but without this the image is sometimes not properly centered and/or may have extra space below it
    theme => ({ borderRadius: '50%', ...getTokenIconSizeSx(theme, size) }),
    sx,
    disabled && { filter: 'saturate(0)' },
  )
  const testId = `token-icon-${tooltip || toArray(address).join('-')}`
  return (
    <WithWrapper
      shouldWrap={showChainIcon || !!badgeAddress}
      Wrapper={Box}
      sx={{
        position: 'relative', // to position overlay icons on top of the token icon
      }}
    >
      <Tooltip title={tooltip} placement="top">
        {Array.isArray(address) ? (
          <Box
            data-testid={testId}
            className={`${className}`}
            sx={applySxProps(
              { position: 'relative', overflow: 'hidden', backgroundColor: t => t.design.Layer[3].Fill },
              iconSx,
            )}
          >
            {address.map((tokenAddress, index) => (
              <TokenImage
                key={tokenAddress}
                blockchainId={blockchainId}
                address={tokenAddress}
                alt={tooltip}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  ...squareSize('100%'),
                  /** Shows the left half of the first token and the right half of the second token */
                  clipPath: ['inset(0 50% 0 0)', 'inset(0 0 0 50%)'][index],
                }}
              />
            ))}
          </Box>
        ) : (
          <TokenImage
            blockchainId={blockchainId}
            address={address}
            data-testid={testId}
            className={`${className}`}
            alt={tooltip}
            sx={iconSx}
          />
        )}
      </Tooltip>
      {showChainIcon && <TokenChainIcon disabled={disabled} chain={blockchainId} />}
      {badgeAddress && (
        <TokenBadge tooltipTitle={badgeAddress} position="br">
          <BadgeIcon
            testId={`token-secondary-icon-${blockchainId}-${badgeAddress}`}
            alt={blockchainId}
            src={getTokenImageUrl(blockchainId, badgeAddress)}
            disabled={disabled}
            onError={({ currentTarget }) => (currentTarget.src = FallbackIcon)}
          />
        </TokenBadge>
      )}
    </WithWrapper>
  )
}
