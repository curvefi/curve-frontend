import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketSectionId, MarketSectionOption } from './types'

const { Spacing } = SizesAndSpaces
const SCROLL_GAP_PX = 8

export const MarketSectionNav = ({ sections }: { sections: MarketSectionOption[] }) => {
  const navRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState<MarketSectionId | undefined>(sections[0]?.value)
  const activeValue = sections.some(section => section.value === activeSection) ? activeSection : sections[0]?.value

  const scrollToSection = (section: MarketSectionOption) => {
    section.onClick?.()
    setActiveSection(section.value)

    const sectionElement = section.ref.current
    if (!sectionElement) return

    const stickyBottom = navRef.current?.getBoundingClientRect().bottom ?? 0
    window.scrollBy({
      top: sectionElement.getBoundingClientRect().top - stickyBottom - SCROLL_GAP_PX,
      behavior: 'smooth',
    })
  }

  if (!sections.length) return null

  return (
    <Box
      ref={navRef}
      data-testid="market-section-nav"
      sx={{
        borderBottom: '1px solid',
        borderColor: t => t.design.Color.Neutral[200],
        marginBlockEnd: Spacing.md,
        overflow: 'hidden',
      }}
    >
      <TabsSwitcher
        variant="underlined"
        size="small"
        value={activeValue}
        options={sections}
        onChange={value => {
          const section = sections.find(section => section.value === value)
          if (section) scrollToSection(section)
        }}
        overflow="standard"
        hideInactiveBorders
        sx={{
          '& .MuiTabs-scroller': {
            overflowX: 'auto !important',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          },
          '& .MuiTabs-scroller::-webkit-scrollbar': {
            display: 'none',
          },
          '& .MuiTabs-list': {
            width: 'max-content',
          },
        }}
        testIdPrefix="market-section-nav"
      />
    </Box>
  )
}
