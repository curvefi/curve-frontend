import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { useLocation } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils/mui'
import type { MarketSectionId, MarketSectionOption } from './types'

const { Spacing } = SizesAndSpaces

/**
 * Order: top, right, bottom, left. The negative margins leave a 10%-high activation strip between 20% and 30% from the
 * top of the viewport, so the section crossing that strip is considered active.
 */
const ACTIVE_SECTION_ROOT_MARGIN = '-20% 0px -70% 0px'

/** Keeps the active section and scroll position synchronized with the URL hash. */
const useSectionHashNavigation = (sections: readonly MarketSectionOption[]) => {
  const { hash } = useLocation()
  const scrolledHashRef = useRef('')
  const [activeSection, setActiveSection] = useState<MarketSectionId | undefined>(() => {
    const sectionId = hash.slice(1)
    return sections.find(({ value }) => value === sectionId)?.value ?? sections[0]?.value
  })

  useEffect(() => {
    const sectionId = hash.slice(1)
    const section = sections.find(({ value }) => value === sectionId)
    // Router hash changes must override the current scroll-spy selection.
    // eslint-disable-next-line @eslint-react/set-state-in-effect
    if (section) setActiveSection(section.value)
    // The target may render after TanStack Router's initial hash scroll attempt.
    const target = section && document.getElementById(section.value)
    if (target && scrolledHashRef.current !== hash) {
      scrolledHashRef.current = hash
      target.scrollIntoView()
    }
  }, [hash, sections])

  return [activeSection, setActiveSection] as const
}

/** Updates the active section as the user scrolls through the page. */
const useSectionScrollSpy = (
  sections: readonly MarketSectionOption[],
  setActiveSection: (section: MarketSectionId) => void,
) => {
  useEffect(() => {
    const elements = sections
      .map(({ value }) => document.getElementById(value))
      .filter((element): element is HTMLElement => element != null)
    if (!elements.length) return

    // Mark the first section crossing the activation area as active.
    const observer = new IntersectionObserver(
      entries => {
        const activeEntry = entries.find(({ isIntersecting }) => isIntersecting)
        if (activeEntry) setActiveSection(activeEntry.target.id as MarketSectionId)
      },
      { rootMargin: ACTIVE_SECTION_ROOT_MARGIN },
    )

    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [sections, setActiveSection])
}

export const MarketSectionNav = ({ sections }: { sections: readonly MarketSectionOption[] }) => {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useSectionHashNavigation(sections)
  useSectionScrollSpy(sections, setActiveSection)

  return (
    !!sections.length && (
      <Box
        component="nav"
        data-testid="market-section-nav"
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
          testIdPrefix="market-section-nav"
          value={activeSection}
          variant="underlined"
        />
      </Box>
    )
  )
}
