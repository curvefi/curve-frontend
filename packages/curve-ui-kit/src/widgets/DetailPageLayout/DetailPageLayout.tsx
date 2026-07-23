import { type ReactNode, useRef } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack, { StackProps } from '@mui/material/Stack'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { mapBreakpoints } from '@ui-kit/themes/basic-theme/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PAGE_SPACING } from './constants'
import { getIsMobileFormDrawer } from './form-context/FormPlacementContext'
import { FormPlacementProvider } from './form-context/FormPlacementProvider'
import { FormSkeleton } from './FormSkeleton'
import type { DetailPageLayoutFormTabs } from './types'

const { ButtonSize, MaxWidth, Spacing } = SizesAndSpaces

const PAGE_MARGIN = { marginInline: Spacing.md, marginBlockStart: Spacing.md, marginBlockEnd: Spacing.xxl }

/**
 * Creates the scroll container boundary for the mobile drawer action bar. The action bar is position: sticky, so
 * wrapping the page content keeps it from scrolling past DetailPageLayout into the global footer.
 */
const MobileDrawerBoundary = ({ children }: { children: ReactNode }) => (
  <Box sx={{ position: 'relative' }}>{children}</Box>
)

/**
 * CSS rules for making the page header sticky.
 *
 * There is a gap between the navbar and the page title where scrolled content can briefly become visible. To prevent this,
 * a negative margin is applied and the same value is added as top padding so the header remains visually fixed in the intended position.
 *
 * An alternative approach would be using a ::before pseudo-element to mask the scrolling content.
 */
const stickyHeaderSx = (navHeight: number): StackProps['sx'] => ({
  position: { tablet: 'sticky' },
  top: { tablet: `${navHeight}px` },
  marginBlockStart: { tablet: `calc(${PAGE_MARGIN.marginBlockStart.tablet} * -1)` },
  zIndex: t => t.zIndex.appBar - 1,
  backgroundColor: t => t.palette.background.default,
  paddingBlockStart: {
    tablet: PAGE_MARGIN.marginBlockStart.tablet,
  },
})

/** CSS rules for making the form tabs sticky */
const stickyFormTabsSx = (navHeight: number, pageHeaderHeight: number) => ({
  alignSelf: { tablet: 'flex-start' },
  position: { tablet: 'sticky' },
  // additional margin to make the forms start at the same height as the page content
  marginBlockStart: { desktop: `calc(${pageHeaderHeight}px - ${PAGE_MARGIN.marginBlockStart.desktop})` },
  // mobile breakpoint is not used because sticky only starts at tablet breakpoint
  top: mapBreakpoints(PAGE_MARGIN.marginBlockStart, marginBlockStart => `calc(${navHeight}px + ${marginBlockStart})`),
})

/**
 * A grid that separates the detail page into two or three main sections:
 * 1. action form (`FormTabs`) (right side on large screens, inside a drawer on mobile)
 * 2. market and user position details (right side on larger screens, left side in beta channel)
 * 3. an optional footer that goes at the bottom, but still inside the grid
 */
export const DetailPageLayout = ({
  formTabs,
  header,
  pageNavigation,
  children,
  footer,
  testId,
}: {
  formTabs: DetailPageLayoutFormTabs | null
  header?: ReactNode
  pageNavigation?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  testId?: string
}) => {
  const navHeight = useLayoutStore(state => state.navHeight)
  const isMobile = useIsMobile()
  // header ref needed to compute the top position of the sticky forms
  const headerRef = useRef<HTMLDivElement>(null)
  const pageNavigationRef = useRef<HTMLDivElement>(null)
  // page header metrics's notionals lazy rendering make the height change by 9px so we need a smaller threshold
  const [, pageHeaderHeight = 0] = useResizeObserver(headerRef, { threshold: 5 })
  const [, pageNavigationHeight] = useResizeObserver(pageNavigationRef, { enabled: !!pageNavigation })
  const pageNavigationOffset = pageNavigationHeight ? `${pageNavigationHeight}px` : ButtonSize.md
  const placement = formTabs?.placement ?? 'inline'
  const showMobileDrawer = getIsMobileFormDrawer(placement, isMobile)

  const headerStack = header && (
    <Stack ref={headerRef} sx={pageNavigation ? undefined : stickyHeaderSx(navHeight)}>
      {header}
    </Stack>
  )
  const pageNavigationStack = pageNavigation && (
    <Stack
      ref={pageNavigationRef}
      sx={{
        backgroundColor: theme => theme.palette.background.default,
        position: { tablet: 'sticky' },
        top: { tablet: `${navHeight}px` },
        zIndex: theme => theme.zIndex.appBar - 1,
      }}
    >
      {pageNavigation}
    </Stack>
  )
  return (
    <WithWrapper shouldWrap={showMobileDrawer} Wrapper={MobileDrawerBoundary}>
      <Grid
        container
        data-testid={testId ?? 'detail-page-layout'}
        spacing={PAGE_SPACING}
        sx={{
          ...PAGE_MARGIN,
          ...(pageNavigation && {
            '--detail-page-scroll-margin-top': `calc(${navHeight}px + ${pageNavigationOffset})`,
          }),
          ...(!header && { marginBlockStart: Spacing.xl }),
        }}
        direction="row-reverse" // direction is only used when size<12 (on mobile, form shows first, otherwise children first)
      >
        {isMobile && (
          <Grid size={12}>
            <Stack>
              {headerStack}
              {pageNavigationStack}
            </Stack>
          </Grid>
        )}
        {/* In Figma, columns are 12/4/3, but too small around breakpoints. I've added one extra column.
            Ultrawide isn't a breakpoint yet, use maxWidth so it's not too large. */}
        {formTabs !== null && !showMobileDrawer && (
          <Grid
            size={{ mobile: 12, tablet: 5, desktop: 4 }}
            sx={{
              maxWidth: { desktop: MaxWidth.actionCard },
              ...stickyFormTabsSx(navHeight, pageHeaderHeight),
            }}
          >
            <FormPlacementProvider placement={placement}>{formTabs?.content || <FormSkeleton />}</FormPlacementProvider>
          </Grid>
        )}
        <Grid size="grow">
          {/* Additional Stack because no gap between the page header and the children */}
          <Stack>
            {!isMobile && headerStack}
            {!isMobile && pageNavigationStack}
            <Stack sx={{ flexGrow: 1, gap: PAGE_SPACING }}>{children}</Stack>
          </Stack>
        </Grid>
        {footer && <Grid size={12}>{footer}</Grid>}
      </Grid>
      {formTabs !== null && showMobileDrawer && (
        <FormPlacementProvider placement={placement}>{formTabs?.content}</FormPlacementProvider>
      )}
    </WithWrapper>
  )
}
