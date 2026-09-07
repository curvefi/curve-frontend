import type { ReactNode } from 'react'
import Typography from '@mui/material/Typography'
import { CURVE_LOGO_URL } from '@ui/lib/resource.constants'

/**
 * Duplicate code from the index.html file, reusing the styles defined there, avoiding layout shifts during loading.
 * This component is used while the app is loading the chunk for the route, generally with a visible header.
 */
export const Loading = ({ title = 'Curve', subtitle }: { title?: ReactNode; subtitle?: ReactNode }) => (
  <div className="initial-load">
    <div className="content">
      <img src={CURVE_LOGO_URL} alt="Curve" width="30%" className="logo" />
      <span className="title">{title}</span>
      {subtitle && <Typography variant="highlightXl">{subtitle}</Typography>}
      <div className="loader" aria-label="Loading"></div>
    </div>
  </div>
)
