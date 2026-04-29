import { type ReactNode, useRef } from 'react'
import Grid from '@mui/material/Grid'
import Stack, { StackProps } from '@mui/material/Stack'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useRightFormTabsLayout } from '@ui-kit/hooks/useFeatureFlags'
import { useResizeObserver } from '@ui-kit/hooks/useResizeObserver'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PAGE_SPACING } from './constants'
import { FormSkeleton } from './FormSkeleton'

const { MaxWidth, Spacing } = SizesAndSpaces

const PAGE_MARGIN = { marginInline: Spacing.md, marginBlockStart: Spacing.md, marginBlockEnd: Spacing.xxl }

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
  top: {
    // removed page header height as it can be too big for tablet
    tablet: `calc(${navHeight}px + ${PAGE_MARGIN.marginBlockStart.tablet})`,
    // page margin block start already included in the header height
    desktop: `calc(${navHeight}px + ${pageHeaderHeight}px + ${pageHeaderHeight ? '0px' : PAGE_MARGIN.marginBlockStart.desktop})`,
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
  const navHeight = useLayoutStore(state => state.navHeight)
  const isNewLayout = useRightFormTabsLayout()
  const isMobile = useIsMobile()
  // header ref needed to compute the top position of the sticky forms
  const headerRef = useRef<HTMLDivElement>(null)
  const [, pageHeaderHeight = 0] = useResizeObserver(headerRef) ?? []

  const renderHeader = header && (
    <Stack ref={headerRef} sx={stickyHeaderSx(navHeight)}>
      {header}
    </Stack>
  )

  return (
    <Grid
      container
      data-testid="detail-page-layout"
      spacing={PAGE_SPACING}
      sx={PAGE_MARGIN}
      direction={isNewLayout ? 'row-reverse' : 'row'}
    >
      {isMobile && <Grid size={12}>{renderHeader}</Grid>}
      {/* In Figma, columns are 12/4/3, but too small around breakpoints. I've added one extra column.
          Ultrawide isn't a breakpoint yet, use maxWidth so it's not too large. */}
      {formTabs !== null && (
        <Grid
          size={{ mobile: 12, tablet: 5, desktop: 4 }}
          maxWidth={{ desktop: MaxWidth.actionCard }}
          sx={{
            ...(isNewLayout && stickyFormTabsSx(navHeight, pageHeaderHeight)),
          }}
        >
          {formTabs || <FormSkeleton />}
        </Grid>
      )}
      <Grid size="grow">
        {/* Additional Stack because no gap between the page header and the children */}
        <Stack>
          {!isMobile && renderHeader}
          <Stack flexGrow={1} gap={PAGE_SPACING}>
            {children}
          </Stack>
        </Stack>
      </Grid>

      {footer && <Grid size={12}>{footer}</Grid>}
    </Grid>
  )
}
