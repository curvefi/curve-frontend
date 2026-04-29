import Box from '@mui/material/Box'
import type { Theme } from '@mui/material/styles'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'
import { BadgeIcon } from './BadgeIcon'
import { TokenBadge } from './TokenBadge'
import { TokenChainIcon } from './TokenChainIcon'
import { WithWrapper } from './WithWrapper'

const DEFAULT_IMAGE = '/images/default-crypto.png'

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
  address ? `${getImageBaseUrl(blockchainId)}${address.toLowerCase()}.png` : DEFAULT_IMAGE

const getTokenIconSizeSx = (theme: Theme, size: Size) =>
  // The original 'sm' size with a 400 breakpoint is a remainder from legacy code.
  // I didn't want to break the existing interface as it's used everywhere.
  size === 'sm'
    ? { ...squareSize('1.75rem'), [theme.breakpoints.down(400)]: squareSize('1.5rem') }
    : handleBreakpoints(squareSize(MAIN_ICON_SIZE[size]))

// TODO: For another time, we should infer the size type from `keyof typeof IconSize` and generate
// the corresponding size classes programmatically. This component is also used in legacy UI,
// where 'sm' differs from MUI's 'sm'. At the moment of writing this refactor is out of scope.
export type Size = 'sm' | 'mui-sm' | 'mui-md' | 'xs' | 'lg' | 'xl'

export const DEFAULT_SIZE: Size = 'sm'

export type TokenIconProps = {
  /** Additional CSS class name to apply to the token icon */
  className?: string
  /** Blockchain ID used for constructing the image URL */
  blockchainId?: string
  /** Tooltip text to display on hover */
  tooltip?: string
  /** Size variant for the token icon */
  size?: Size
  /** Token contract address used for fetching the icon image */
  address?: string | null
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
}: TokenIconProps) => (
  <WithWrapper
    shouldWrap={showChainIcon || !!badgeAddress}
    Wrapper={Box}
    sx={{
      position: 'relative', // to position overlay icons on top of the token icon
    }}
  >
    <Tooltip title={tooltip} placement="top">
      <Box
        component="img"
        data-testid={`token-icon-${tooltip || address}`}
        className={`${className}`}
        alt={tooltip}
        onError={({ currentTarget }) => {
          currentTarget.src = DEFAULT_IMAGE
        }}
        src={getTokenImageUrl(blockchainId, address)}
        loading="lazy"
        sx={applySxProps(
          theme => ({
            borderRadius: '50%',
            ...getTokenIconSizeSx(theme, size),
          }),
          sx,
          disabled && {
            filter: 'saturate(0)',
          },
        )}
      />
    </Tooltip>
    {showChainIcon && <TokenChainIcon disabled={disabled} chain={blockchainId} />}
    {badgeAddress && (
      <TokenBadge tooltipTitle={badgeAddress} position="br">
        <BadgeIcon
          testId={`token-secondary-icon-${blockchainId}-${badgeAddress}`}
          alt={blockchainId}
          src={getTokenImageUrl(blockchainId, badgeAddress)}
          disabled={disabled}
          onError={({ currentTarget }) => {
            currentTarget.src = DEFAULT_IMAGE
          }}
        />
      </TokenBadge>
    )}
  </WithWrapper>
)
