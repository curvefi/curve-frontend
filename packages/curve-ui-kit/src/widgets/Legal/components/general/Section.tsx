import { ReactNode, Children, isValidElement } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export const Header = ({ children }: { children?: ReactNode }) => (
  <Stack
    sx={{
      justifyContent: 'end',
      borderBottom: borderStyle,
      paddingBlockStart: Spacing.lg,
      paddingInline: Spacing.md,
    }}
  >
    <Typography variant="headingSBold">{children}</Typography>
  </Stack>
)

export const Title = ({ children }: { children?: ReactNode }) => (
  <Typography variant="headingXsBold" color="textSecondary">
    {children}
  </Typography>
)

export const SubTitle = ({ children }: { children?: ReactNode }) => (
  <Typography variant="bodyMBold" color="textSecondary">
    {children}
  </Typography>
)

export const Paragraph = ({ children }: { children?: ReactNode }) => (
  <Typography component="div" variant="bodyMRegular" color="textSecondary">
    {children}
  </Typography>
)

export const Bold = ({ children }: { children: ReactNode }) => (
  <Typography component="span" variant="bodyMBold" sx={{ display: 'inline' }}>
    {children}
  </Typography>
)

export const Section = ({ children }: { children?: ReactNode }) => {
  const childArray = Children.toArray(children)
  const title = childArray.find(child => isValidElement(child) && child.type === Title)
  const content = childArray.filter(child => isValidElement(child) && child.type !== Title)

  return (
    <Stack
      sx={{
        gap: Spacing.md,

        // Adds extra margin between consecutive Sections.
        // Not defined in parent since it can host other elements like headers,
        // where this extra spacing should not apply.
        '& + &': {
          marginBlockStart: Spacing.md,
        },

        marginInline: Spacing.md,
      }}
    >
      {title}
      <Stack sx={{ gap: Spacing.md }}>{content}</Stack>
    </Stack>
  )
}
