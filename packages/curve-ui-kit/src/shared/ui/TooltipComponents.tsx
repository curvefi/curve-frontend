import { Children, type ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import type { SxProps } from '@mui/material/styles'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { TokenIcon, type Size } from '@ui-kit/shared/ui/TokenIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { applySxProps } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export type TooltipWrapperProps = {
  children: ReactNode
}

export const TooltipWrapper = ({ children }: TooltipWrapperProps) => (
  <Stack sx={{ gap: Spacing.sm, maxWidth: '20rem' }}>{children}</Stack>
)

export type TooltipDescriptionProps = {
  text: ReactNode | string
}

export const TooltipDescription = ({ text }: TooltipDescriptionProps) => (
  <Typography variant="bodySRegular" component="span">
    {text}
  </Typography>
)

/**
 * The visual treatment of a tooltip item.
 * - default: standard bold item
 * - primary: sum row displayed in the primary color
 * - subItem: indented detail row with regular typography
 * - independent: compact row used outside a grouped breakdown
 */
export type TooltipItemVariant = 'default' | 'primary' | 'subItem' | 'independent'

const titleTypographyVariant: Record<TooltipItemVariant, TypographyVariantKey> = {
  default: 'bodySBold',
  primary: 'bodySBold',
  subItem: 'bodySRegular',
  independent: 'bodySRegular',
}

const valueTypographyVariant: Record<TooltipItemVariant, TypographyVariantKey> = {
  default: 'bodySBold',
  primary: 'bodySBold',
  subItem: 'bodySRegular',
  independent: 'bodySBold',
}

const titleTypographyColor: Record<TooltipItemVariant, TypographyProps['color']> = {
  default: 'textSecondary',
  primary: 'textPrimary',
  subItem: 'textSecondary',
  independent: 'textSecondary',
}

const valueTypographyColor: Record<TooltipItemVariant, TypographyProps['color']> = {
  default: 'textPrimary',
  primary: 'primary',
  subItem: 'textPrimary',
  independent: 'textPrimary',
}

export type TooltipItemProps = {
  title: ReactNode
  children?: ReactNode
  /** Shows a skeleton in place of the value. */
  loading?: boolean
  variant?: TooltipItemVariant
  /** Token metadata used to render a token icon before the title. */
  titleIcon?: { blockchainId: string; address: string; size: Size }
  /** Custom content rendered before the title. */
  titleAdornment?: ReactNode
  sx?: SxProps
}

export const TooltipItem = ({
  title,
  children,
  loading = false,
  variant = 'default',
  titleIcon,
  titleAdornment,
  sx,
}: TooltipItemProps) => (
  <Stack direction="row" sx={applySxProps({ gap: Spacing.sm, justifyContent: 'space-between' }, sx)}>
    <Stack direction="row" sx={{ gap: Spacing.xxs, alignItems: 'center' }}>
      {titleAdornment && <Stack sx={{ alignItems: 'center', marginLeft: Spacing.md }}>{titleAdornment}</Stack>}
      {titleIcon && (
        <TokenIcon
          blockchainId={titleIcon.blockchainId}
          address={titleIcon.address}
          size={titleIcon.size}
          sx={{ marginLeft: Spacing.md }}
        />
      )}
      <Typography
        color={titleTypographyColor[variant]}
        variant={titleTypographyVariant[variant]}
        component="span"
        {...(variant === 'subItem' &&
          titleIcon == null &&
          titleAdornment == null && {
            sx: {
              marginLeft: Spacing.md,
            },
          })}
      >
        {title}
      </Typography>
    </Stack>
    <WithSkeleton loading={loading}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        {/* eslint-disable-next-line @eslint-react/no-children-map -- Existing violation before enabling this rule. */}
        {Children.map(children, (child, index) => {
          const isFirstChild = index === 0
          const typographyVariant = isFirstChild ? valueTypographyVariant[variant] : 'bodyXsRegular'
          const typographyColor = isFirstChild ? valueTypographyColor[variant] : 'tertiary'

          return (
            <Typography
              variant={typographyVariant}
              color={typographyColor}
              component="span"
              sx={{ textAlign: 'right' }}
            >
              {child}
            </Typography>
          )
        })}
      </Stack>
    </WithSkeleton>
  </Stack>
)

export type TooltipItemsProps = {
  children: ReactNode
  secondary?: boolean
  borderTop?: boolean
  extraMargin?: boolean
}

export const TooltipItems = ({ children, secondary, borderTop = false, extraMargin = false }: TooltipItemsProps) => (
  <Stack
    sx={{
      ...(borderTop && { borderTop: t => `1px solid ${t.design.Layer[3].Outline}` }),
      ...(secondary && { backgroundColor: t => t.design.Layer[2].Fill }),
      padding: Spacing.sm,
      gap: Spacing.xs,
      marginTop: extraMargin ? Spacing.sm : 0,
    }}
  >
    {children}
  </Stack>
)

export type TooltipFooterProps = {
  children: ReactNode
}

export const TooltipFooter = ({ children }: TooltipFooterProps) => (
  <Typography variant="bodyXsRegular" component="span" sx={{ fontStyle: 'italic' }}>
    {children}
  </Typography>
)
