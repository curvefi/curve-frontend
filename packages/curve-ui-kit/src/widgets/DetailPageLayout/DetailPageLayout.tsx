import { type ReactNode, useRef } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useRightFormTabsLayout } from '@ui-kit/hooks/useFeatureFlags'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PAGE_MARGIN, PAGE_SPACING } from './constants'
import { FormSkeleton } from './FormSkeleton'

const { MaxWidth } = SizesAndSpaces

const stickySx = (navHeight: number, pageHeaderHeight: number) => ({
  alignSelf: { tablet: 'flex-start' },
  position: { tablet: 'sticky' },
  top: {
    tablet: `calc(${navHeight}px + ${pageHeaderHeight}px + ${pageHeaderHeight ? PAGE_MARGIN.marginBlockStart.tablet : '0px'})`,
  },
})

/**
 * A grid that separates the detail page into two or three main sections:
 * 1. action form (`FormTabs`) (left side on larger screens, right side in beta channel)
 * 2. market and user position details (right side on larger screens, left side in beta channel)
 * 3. an optional footer that goes at the bottom, but still inside the grid
 */
export const DetailPageLayout = ({
  formTabs,
  header,
  children,
  footer,
}: {
  formTabs: ReactNode
  header?: ReactNode
  children?: ReactNode
  footer?: ReactNode
}) => {
  const navHeight = useLayoutStore((state) => state.navHeight)
  const isNewLayout = useRightFormTabsLayout()
  const isDesktop = useIsDesktop()
  // header ref needed to compute the top position of the sticky forms
  const headerRef = useRef<HTMLDivElement>(null)
  const [, pageHeaderHeight = 0] = useResizeObserver(headerRef) ?? []

  return (
    <Grid container data-testid="detail-page-layout" spacing={PAGE_SPACING} sx={PAGE_MARGIN}>
      {/* In Figma, columns are 12/4/3, but too small around breakpoints. I've added one extra column.
          Ultrawide isn't a breakpoint yet, use maxWidth so it's not too large. */}
      {formTabs !== null && (
        <>
          <Grid
            size={{ mobile: 12, tablet: 5, desktop: 4 }}
            maxWidth={{ desktop: MaxWidth.actionCard }}
            sx={{
              // action forms on the right for Beta
              order: { mobile: 1, tablet: isNewLayout ? 2 : 1 },
              // include page header height for desktop only, page header height can be too big for tablet
              ...(isNewLayout && stickySx(navHeight, isDesktop ? pageHeaderHeight : 0)),
            }}
          >
            {formTabs || <FormSkeleton />}
          </Grid>
          <Grid size="grow" sx={{ order: { mobile: 2, tablet: isNewLayout ? 1 : 2 } }}>
            {/* Additional Stack because no gap between the page header and the children */}
            <Stack flexDirection="column">
              {header && <Stack ref={headerRef}>{header}</Stack>}
              <Stack flexDirection="column" flexGrow={1} gap={PAGE_SPACING}>
                {children}
              </Stack>
            </Stack>
          </Grid>
        </>
      )}

      {footer && <Grid size={12}>{footer}</Grid>}
    </Grid>
  )
}
