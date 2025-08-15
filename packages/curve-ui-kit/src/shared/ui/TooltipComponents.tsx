import React, { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography, { TypographyProps } from '@mui/material/Typography'
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
}: {
  title: ReactNode
  children?: ReactNode
  loading?: boolean // shows skeleton instead of children
  variant?: ItemVariant
}) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography
      color={titleTypographyColor[variant]}
      variant={titleTypographyVariant[variant]}
      {...(variant === 'subItem' && {
        sx: {
          marginLeft: Spacing.md,
        },
      })}
    >
      {title}
    </Typography>
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

export const TooltipItems = ({ children, secondary }: { children: ReactNode; secondary?: boolean }) => (
  <Stack padding={Spacing.sm} gap={Spacing.xs} {...(secondary && { bgcolor: (t) => t.design.Layer[2].Fill })}>
    {children}
  </Stack>
)

export const TooltipWrapper = ({ children }: { children: ReactNode }) => (
  <Stack gap={Spacing.sm} sx={{ maxWidth: '20rem' }}>
    {children}
  </Stack>
)

export const TooltipDescription = ({ text }: { text: string }) => <Typography variant="bodySRegular">{text}</Typography>
