import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

/**
 * A wrapper for the table filters that provides consistent spacing and an optional title.
 */
export const TableFilterItem = ({ title, children }: { title: ReactNode; children: ReactNode }) => (
  <Stack>
    <Typography display={{ mobile: 'none', tablet: 'block' }} variant="bodyXsRegular" color="textTertiary">
      {title}
    </Typography>
    {children}
  </Stack>
)
