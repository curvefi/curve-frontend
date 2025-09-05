import React, { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography, { TypographyProps } from '@mui/material/Typography'
import { TokenIcon, type Size } from '@ui-kit/shared/ui/TokenIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TypographyVariantKey } from '@ui-kit/themes/typography'

const { Spacing } = SizesAndSpaces

/**
 * The variant of the item.
 * - default: default variant
 * - primary: used for the sum rows, displayed in primary color
 * - subItem: adds some extra padding and non-bold font weight
 * - independent: used for smaller compositions of rows
 */
type ItemVariant = 'default' | 'primary' | 'subItem' | 'independent'

const titleTypographyVariant: Record<ItemVariant, TypographyVariantKey> = {
  default: 'bodySBold',
  primary: 'bodySBold',
  subItem: 'bodySRegular',
  independent: 'bodySRegular',
}

const valueTypographyVariant: Record<ItemVariant, TypographyVariantKey> = {
  default: 'bodySBold',
  primary: 'bodySBold',
  subItem: 'bodySRegular',
  independent: 'bodySBold',
}

const titleTypographyColor: Record<ItemVariant, TypographyProps['color']> = {
  default: 'textSecondary',
  primary: 'textPrimary',
  subItem: 'textSecondary',
  independent: 'textSecondary',
}

const valueTypographyColor: Record<ItemVariant, TypographyProps['color']> = {
  default: 'textSecondary',
  primary: 'primary',
  subItem: 'textPrimary',
  independent: 'textPrimary',
}

export const TooltipItem = ({
  title,
  children,
  loading = false,
  variant = 'default',
  titleIcon,
}: {
  title: ReactNode
  children?: ReactNode
  loading?: boolean // shows skeleton instead of children
  variant?: ItemVariant
  titleIcon?: { blockchainId: string; address: string; size: Size }
}) => (
  <Stack direction="row" justifyContent="space-between">
    <Stack direction="row" gap={Spacing.xxs} alignItems="center">
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
        {...(variant === 'subItem' &&
          titleIcon == null && {
            sx: {
              marginLeft: Spacing.md,
            },
          })}
      >
        {title}
      </Typography>
    </Stack>
    <WithSkeleton loading={loading}>
      <Stack direction="row" spacing={1}>
        {React.Children.map(children, (child, index) => {
          const isFirstChild = index === 0
          const typographyVariant = isFirstChild ? valueTypographyVariant[variant] : 'bodySRegular'
          const typographyColor = isFirstChild ? valueTypographyColor[variant] : 'textSecondary'

          return (
            <Typography variant={typographyVariant} color={typographyColor}>
              {child}
            </Typography>
          )
        })}
      </Stack>
    </WithSkeleton>
  </Stack>
)

export const TooltipItems = ({
  children,
  secondary,
  borderTop = false,
  extraMargin = false,
}: {
  children: ReactNode
  secondary?: boolean
  borderTop?: boolean
  extraMargin?: boolean
}) => (
  <Stack
    padding={Spacing.sm}
    gap={Spacing.xs}
    marginTop={extraMargin ? Spacing.sm : 0}
    {...(borderTop && { borderTop: (t) => `1px solid ${t.design.Layer[3].Outline}` })}
    {...(secondary && { bgcolor: (t) => t.design.Layer[2].Fill })}
  >
    {children}
  </Stack>
)

export const TooltipWrapper = ({ children }: { children: ReactNode }) => (
  <Stack gap={Spacing.sm} sx={{ maxWidth: '20rem' }}>
    {children}
  </Stack>
)

export const TooltipDescription = ({ text }: { text: string }) => <Typography variant="bodySRegular">{text}</Typography>
