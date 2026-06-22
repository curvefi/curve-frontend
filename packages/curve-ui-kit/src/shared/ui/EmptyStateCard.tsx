import { ReactNode } from 'react'
import { Box, Button, ButtonProps, Skeleton } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ConnectWalletButton } from '@ui-kit/features/connect-wallet/ui/ConnectWalletButton'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Responsive } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'
import { ExternalLink } from './ExternalLink'

const { Spacing, IconSize, MaxWidth, LineHeight } = SizesAndSpaces

type EmptyStateButtonProps = Omit<ButtonProps, 'type'> & {
  label?: ReactNode
  type?: 'button' | 'connect-wallet'
  testId?: string
}

type EmptyStateCardProps = {
  title?: ReactNode
  description?: ReactNode
  isLoading?: boolean
  size?: 'sm' | 'md'
  button?: EmptyStateButtonProps
  secondaryButton?: EmptyStateButtonProps
}

const SIZE_CONFIG: Record<
  NonNullable<EmptyStateCardProps['size']>,
  { icon: Responsive; button: ButtonProps['size'] }
> = {
  sm: { icon: IconSize.lg, button: 'small' },
  md: { icon: IconSize.xxl, button: 'medium' },
}

const Skeletons = () => (
  <Stack sx={{ gap: Spacing.sm, width: MaxWidth.emptyStateCard }}>
    <Skeleton variant="rectangular" sx={{ height: LineHeight.sm }} />
    <Skeleton variant="rectangular" sx={{ height: LineHeight.xl }} />
  </Stack>
)
const EmptyStateButton = ({
  button,
  size,
}: {
  button: NonNullable<EmptyStateCardProps['button']>
  size: NonNullable<EmptyStateCardProps['size']>
}) => {
  const { label, sx: buttonSx, testId, href, type = 'button', ...buttonProps } = button ?? {}
  const sharedProps = {
    ...buttonProps,
    variant: 'outlined',
    size: SIZE_CONFIG[size].button,
    href,
    sx: applySxProps({ alignSelf: 'center' }, buttonSx),
    ...(testId && { 'data-testid': testId }),
  } as const
  return type === 'connect-wallet' ? (
    <ConnectWalletButton {...sharedProps} label={label} />
  ) : href?.startsWith('https') ? (
    <ExternalLink {...sharedProps} href={href} label={label} wide />
  ) : (
    <Button {...sharedProps}>{label}</Button>
  )
}

export const EmptyStateCard = ({
  title,
  description,
  button,
  secondaryButton,
  isLoading,
  size = 'md',
}: EmptyStateCardProps) => (
  <Stack
    sx={{
      gap: Spacing.xs,
      alignItems: 'center',
      justifySelf: 'center',
      maxWidth: MaxWidth.emptyStateCard,
    }}
  >
    <LlamaIcon sx={{ width: SIZE_CONFIG[size].icon, height: SIZE_CONFIG[size].icon }} />
    {isLoading ? (
      <Skeletons />
    ) : (
      <Stack sx={{ gap: Spacing.sm }}>
        <Stack sx={{ textAlign: 'center' }}>
          {title && (
            <Typography component="span" variant="headingXsBold">
              {title}
            </Typography>
          )}
          {description && (
            <Typography component="span" variant="bodySRegular" color="textSecondary">
              {description}
            </Typography>
          )}
        </Stack>
        {[button, secondaryButton].some(Boolean) && (
          <Box
            sx={{
              display: 'grid', // Using grid here for equal sized buttons
              gridTemplateColumns: !!button && !!secondaryButton ? { tablet: '1fr 1fr' } : undefined,
              gap: Spacing.xs,
              justifyContent: 'center',
            }}
          >
            {button && <EmptyStateButton button={button} size={size} />}
            {secondaryButton && <EmptyStateButton button={secondaryButton} size={size} />}
          </Box>
        )}
      </Stack>
    )}
  </Stack>
)
