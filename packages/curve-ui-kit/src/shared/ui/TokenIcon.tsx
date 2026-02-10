import Box from '@mui/material/Box'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const DEFAULT_IMAGE = '/images/default-crypto.png'

const { IconSize } = SizesAndSpaces

// TODO: For another time, we should infer the size type from `keyof typeof IconSize` and generate
// the corresponding size classes programmatically. This component is also used in legacy UI,
// where 'sm' differs from MUI's 'sm'. At the moment of writing this refactor is out of scope.
export type Size = 'sm' | 'mui-sm' | 'mui-md' | 'lg' | 'xl'

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
  /** Whether the icon should appear disabled (greyed out) */
  disabled?: boolean
  sx?: SxProps
}

export const TokenIcon = ({
  className = '',
  blockchainId = '',
  tooltip = '',
  size = DEFAULT_SIZE,
  address,
  disabled,
  sx,
}: TokenIconProps) => (
  <Tooltip title={tooltip} placement="top">
    <Box
      component="img"
      data-testid={`token-icon-${tooltip || address}`}
      className={`${className}`}
      alt={tooltip}
      onError={({ currentTarget }) => {
        currentTarget.src = DEFAULT_IMAGE
      }}
      src={address ? `${getImageBaseUrl(blockchainId ?? '')}${address.toLowerCase()}.png` : DEFAULT_IMAGE}
      loading="lazy"
      sx={applySxProps(
        (theme) => ({
          borderRadius: '50%',
          // The original 'sm' size with a 400 breakpoint is a remainder from legacy code.
          // I didn't want to break the existing interface as it's used everywhere.
          ...(size === 'sm' && {
            width: '1.75rem',
            height: '1.75rem',
            [theme.breakpoints.down(400)]: {
              width: '1.5rem',
              height: '1.5rem',
            },
          }),
          ...(size === 'mui-sm' && handleBreakpoints({ width: IconSize['sm'], height: IconSize['sm'] })),
          ...(size === 'mui-md' && handleBreakpoints({ width: IconSize['md'], height: IconSize['md'] })),
          ...(size === 'lg' && handleBreakpoints({ width: IconSize['lg'], height: IconSize['lg'] })),
          ...(size === 'xl' && handleBreakpoints({ width: IconSize['xl'], height: IconSize['xl'] })),
        }),
        sx,
        disabled && {
          opacity: 0.5,
          filter: 'saturate(0)',
        },
      )}
    />
  </Tooltip>
)
