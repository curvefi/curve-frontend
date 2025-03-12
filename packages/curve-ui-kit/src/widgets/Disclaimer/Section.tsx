import { ReactNode, Children } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const Header = ({ children }: { children?: ReactNode }) => (
  <Stack
    justifyContent="end"
    sx={{
      borderBottom: (t) => `1px solid ${t.design.Layer[1].Outline}`,
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

export const Paragraph = ({ children }: { children?: ReactNode }) => (
  <Typography component="div" variant="bodyMRegular" color="textSecondary">
    {children}
  </Typography>
)

export const Section = ({ children }: { children?: ReactNode }) => {
  const childArray = Children.toArray(children)
  const title = childArray.find((child) => typeof child === 'object' && 'type' in child && child.type === Title)
  const paragraphs = childArray.filter(
    (child) => typeof child === 'object' && 'type' in child && child.type === Paragraph,
  )

  return (
    <Stack
      gap={Spacing.sm}
      sx={{
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

      <Stack gap={Spacing.md}>{paragraphs}</Stack>
    </Stack>
  )
}
