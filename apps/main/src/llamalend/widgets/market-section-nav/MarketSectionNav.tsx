import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
// eslint-disable-next-line no-restricted-imports
import Tabs from '@mui/material/Tabs'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { TabLabel } from '@ui-kit/shared/ui/Tabs/TabLabel'
import { HIDE_INACTIVE_BORDERS_CLASS, TABS_SIZES_CLASSES, TABS_VARIANT_CLASSES } from '@ui-kit/themes/components/tabs'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketSectionId, MarketSectionOption } from './types'

const { BorderWidth, Spacing } = SizesAndSpaces

export const MarketSectionNav = ({ sections }: { sections: readonly MarketSectionOption[] }) => {
  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState<MarketSectionId | undefined>(() => {
    const hash = typeof window === 'undefined' ? '' : window.location.hash.slice(1)
    return sections.find(({ value }) => value === hash)?.value ?? sections[0]?.value
  })

  useEffect(() => {
    const elements = sections
      .map(({ value }) => document.getElementById(value))
      .filter((element): element is HTMLElement => element != null)
    if (!elements.length) return

    if (window.location.hash) window.location.replace(window.location.hash)

    const observer = new IntersectionObserver(
      entries => {
        const activeEntry = entries.find(({ isIntersecting }) => isIntersecting)
        if (activeEntry) setActiveSection(activeEntry.target.id as MarketSectionId)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    elements.forEach(element => observer.observe(element))
    return () => observer.disconnect()
  }, [sections])

  if (!sections.length) return null

  return (
    <Box
      component="nav"
      aria-label={t`Market sections`}
      data-testid="market-section-nav"
      sx={{
        borderTop: `${BorderWidth.thin} solid`,
        borderBottom: `${BorderWidth.thin} solid`,
        borderColor: theme => theme.design.Tabs.UnderLined.Container_Border,
        overflow: 'hidden',
        paddingBlockStart: Spacing.sm,
      }}
    >
      <Tabs
        aria-label={t`Market sections`}
        allowScrollButtonsMobile
        className={`${TABS_VARIANT_CLASSES.underlined} ${TABS_SIZES_CLASSES.extraSmall} ${HIDE_INACTIVE_BORDERS_CLASS}`}
        scrollButtons="auto"
        value={activeSection ?? false}
        variant="scrollable"
      >
        {sections.map(({ value, label, mobileLabel }) => (
          <Tab
            component="a"
            data-testid={`market-section-nav-${value}`}
            href={`#${value}`}
            key={value}
            label={<TabLabel size="extraSmall" label={isMobile ? (mobileLabel ?? label) : label} />}
            value={value}
          />
        ))}
      </Tabs>
    </Box>
  )
}
