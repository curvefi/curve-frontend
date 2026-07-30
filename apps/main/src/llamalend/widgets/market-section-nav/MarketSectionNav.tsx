import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
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

export const MarketSectionNav = ({ sections }: { sections: readonly MarketSectionOption[] }) => {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState<MarketSectionId | undefined>(() => {
    const hash = typeof window === 'undefined' ? '' : window.location.hash.slice(1)
    return sections.find(({ value }) => value === hash)?.value ?? sections[0]?.value
  })

  // Restore the initial deep link once without moving the user again when sections change.
  useEffect(() => {
    const initialHash = window.location.hash
    if (initialHash) window.location.replace(initialHash)
  }, [])

  // Recreate the observer when the set of rendered sections changes.
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
  }, [sections])

  return (
    !!sections.length && (
      <Box
        component="nav"
        aria-label={t`Market sections`}
        data-testid="market-section-nav"
        sx={{ borderBlock: borderStyle, paddingBlockStart: Spacing.sm }}
      >
        <TabsSwitcher
          aria-label={t`Market sections`}
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
