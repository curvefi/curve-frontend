import { MouseEvent, type ReactNode } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { RouterLink } from '../RouterLink'
import { responsiveTitleEllipsisSx } from '../titleTruncate'
import { CLICKABLE_IN_ROW_CLASS } from './data-table.utils'

/** Title as in, the name of the pool or market, used in the corresponding title cell */
export function TableRowTitle({ title, url, testId }: { title: ReactNode; url: string; testId: string }) {
  const isMobile = useIsMobile()
  return (
    <Typography
      component={Stack}
      variant={isMobile ? 'tableCellMBold' : 'tableCellL'}
      direction="row"
      sx={{ alignItems: 'center', gap: 2 }}
    >
      <RouterLink
        color="inherit"
        underline="none"
        href={url}
        className={CLICKABLE_IN_ROW_CLASS}
        {...(testId && { 'data-testid': `table-row-link-${testId}` })}
        {...(isMobile && {
          // cancel click on mobile so the panel can open, there is a separate button for navigating
          onClick: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault(),
        })}
        sx={{
          // for very small screens, truncate the text and limit to a maximum width
          ...responsiveTitleEllipsisSx,
          paddingBlock: { mobile: '5px', tablet: 0 },
        }}
      >
        {title}
      </RouterLink>
    </Typography>
  )
}
