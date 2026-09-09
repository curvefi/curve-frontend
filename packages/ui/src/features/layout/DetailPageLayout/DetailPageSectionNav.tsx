import Box from '@mui/material/Box'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useActiveSection } from '@ui/hooks/useActiveSection'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { borderStyle } from '@ui/lib/mui'

const { Spacing } = SizesAndSpaces
const DETAIL_PAGE_SECTION_NAV_TEST_ID = 'detail-page-section-nav'

type SectionLabel = {
  default: string
  /** Shortened version of the label used on mobile. */
  short?: string
}

export type DetailPageSectionOption<T extends string> = { value: T; label: SectionLabel }

/** Sticky section navigation for hash-addressable sections within a DetailPageLayout. */
export const DetailPageSectionNav = <T extends string>({
  sections,
}: {
  sections: readonly DetailPageSectionOption<T>[]
}) => {
  const isMobile = useIsMobile()
  const { activeSection, navigationRef } = useActiveSection(sections)

  return (
    !!sections.length && (
      <Box
        ref={navigationRef}
        component="nav"
        data-detail-page-section-nav=""
        data-testid={DETAIL_PAGE_SECTION_NAV_TEST_ID}
        sx={{
          backgroundColor: theme => theme.palette.background.default,
          borderBlock: borderStyle,
          paddingBlockStart: Spacing.sm,
        }}
      >
        <TabsSwitcher
          hideInactiveBorders
          options={sections.map(({ value, label }) => ({
            value,
            label: isMobile ? (label.short ?? label.default) : label.default,
            href: `#${value}`,
          }))}
          size="small"
          testIdPrefix={DETAIL_PAGE_SECTION_NAV_TEST_ID}
          value={activeSection}
          variant="underlined"
        />
      </Box>
    )
  )
}
