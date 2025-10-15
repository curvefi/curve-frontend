import { ReactNode } from 'react'
import Grid, { type GridProps } from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/**
 * A column wrapper for table filters that provides consistent spacing and an optional title.
 * This component wraps filter controls in a responsive Grid column with an optional label.
 */
export const TableFilterColumn = ({
  title,
  children,
  size = { mobile: 12, tablet: 3, desktop: 2.4 },
  ...gridProps
}: {
  title?: string
  children: ReactNode
} & GridProps) => (
  <Grid size={size} {...gridProps}>
    <Stack>
      {title && (
        <Typography variant="bodyXsRegular" color="textTertiary">
          {title}
        </Typography>
      )}
      {children}
    </Stack>
  </Grid>
)
