import { useActiveSection } from '@evm-ui/hooks/useActiveSection'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle } from '@evm-ui/utils/mui'
import Box from '@mui/material/Box'

const { Spacing } = SizesAndSpaces
const DETAIL_PAGE_SECTION_NAV_TEST_ID = 'detail-page-section-nav'

type SectionLabel = {
  default: string
  /** Shortened version of the label used on mobile. */
  short?: string
}

export type DetailPageSectionOption<T extends string> = {
  value: T
  label: SectionLabel
}

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
        sx={{ borderBlock: borderStyle, paddingBlockStart: Spacing.sm }}
      >
        <TabsSwitcher
          hideInactiveBorders
          options={sections.map(({ value, label }) => ({
            value,
            label: isMobile ? (label.short ?? label.default) : label.default,
            href: `#${value}`,
          }))}
          size="extraSmall"
          testIdPrefix={DETAIL_PAGE_SECTION_NAV_TEST_ID}
          value={activeSection}
          variant="underlined"
        />
      </Box>
    )
  )
}
