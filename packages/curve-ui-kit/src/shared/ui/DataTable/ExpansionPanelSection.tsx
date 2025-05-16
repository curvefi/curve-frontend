import { ReactNode } from 'react'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * Expansion panel section used to group children in a grid layout, inside an `ExpansionRow`.
 */
export const ExpansionPanelSection = ({ children, title }: { children: ReactNode[]; title: ReactNode }) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={12}>
      <CardHeader title={title} sx={{ paddingInline: 0 }}></CardHeader>
    </Grid>
    {children.filter(Boolean).map((child, index) => (
      <Grid size={6} key={index}>
        {child}
      </Grid>
    ))}
  </Grid>
)
