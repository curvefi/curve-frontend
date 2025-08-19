import type { ReactNode } from 'react'
import Grid from '@mui/material/Grid'

/**
 * A Grid item for the list of chips. It takes 50% of the width on mobile and auto on larger screens.
 * @param children - The content of the item
 * @param size - The size of the item on mobile (default is 6, which is 50% of the width)
 *    (`Points` can take the full width on mobile)
 * @param alignRight - Used to align the text to the right on the last item.
 * @param extraMargin - For large screens, used to separate the different types of chips
 */
export const ChipGridItem = ({
  children,
  size = 6,
  alignRight,
}: {
  children: ReactNode
  size?: number
  alignRight?: boolean
}) => (
  <Grid
    size={{ mobile: size, tablet: 'auto' }}
    sx={{
      alignContent: 'center',
      ...(alignRight && { textAlign: 'right', '&': { flexGrow: '1' } }),
    }}
  >
    {children}
  </Grid>
)
