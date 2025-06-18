import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getImageBaseUrl } from '@ui/utils/utilsConstants'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

const DEFAULT_IMAGE = '/images/default-crypto.png'

const { Spacing, IconSize } = SizesAndSpaces

// TODO: For another time, we should infer the size type from `keyof typeof IconSize` and generate
// the corresponding size classes programmatically. This component is also used in legacy UI,
// where 'sm' differs from MUI's 'sm'. At the moment of writing this refactor is out of scope.
type Size = 'sm' | 'mui-sm' | 'mui-md' | 'lg' | 'xl'

const DEFAULT_SIZE: Size = 'sm'

const LABEL_SPACING = {
  sm: 'sm',
  'mui-sm': 'sm',
  'mui-md': 'sm',
  lg: 'sm',
  xl: 'md',
} satisfies Record<Size, keyof typeof Spacing>

type TokenIconProps = {
  className?: string
  blockchainId?: string
  tooltip?: string
  size?: Size
  address?: string | null
  sx?: SxProps
}

const TokenIcon = ({
  className = '',
  blockchainId = '',
  tooltip = '',
  size = DEFAULT_SIZE,
  address,
  sx,
}: TokenProps) => (
  <Tooltip title={tooltip} placement="top">
    <Box
      component="img"
      data-testid={`token-icon-${tooltip}`}
      className={`${className}`}
      alt={tooltip}
      onError={({ currentTarget }) => {
        currentTarget.src = DEFAULT_IMAGE
      }}
      src={address ? `${getImageBaseUrl(blockchainId ?? '')}${address.toLowerCase()}.png` : DEFAULT_IMAGE}
      loading="lazy"
      sx={(theme) => ({
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
        ...applySxProps(sx, theme),
      })}
    />
  </Tooltip>
)

type TokenProps = TokenIconProps & {
  label?: string
}

export const Token = ({ label, ...tokenIconProps }: TokenProps) =>
  // Only render the stack if there's a label, otherwise we needlessly render an extra div.
  label ? (
    <Stack direction="row" gap={Spacing[LABEL_SPACING[tokenIconProps.size ?? DEFAULT_SIZE]]} alignItems="center">
      <TokenIcon {...tokenIconProps} />
      <Typography
        variant="bodyMBold"
        sx={{
          // Lineheight is unset, as setting the line height to a certain size (as is default ehavior for Typography)
          // causes the text not to be perfectly centered vertically for unknown reason. Setting the 'vertical-align'
          // property to 'middle' does not appear to fix it, only unsetting the lineheight does.
          '&': { lineHeight: 'unset' },
        }}
      >
        {label}
      </Typography>
    </Stack>
  ) : (
    <TokenIcon {...tokenIconProps} />
  )
