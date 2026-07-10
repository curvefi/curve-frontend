import { useEffect, useEffectEvent } from 'react'
import Box from '@mui/material/Box'
import { useLocation } from '@ui-kit/hooks/router'
import { useLlamaMarketSectionNav } from '@ui-kit/hooks/useFeatureFlags'
import { TabsSwitcher } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { MarketSectionOption } from './types'

const { Spacing } = SizesAndSpaces

export const MarketSectionNav = ({ sections }: { sections: readonly MarketSectionOption[] }) => {
  const isMarketSectionNavEnabled = useLlamaMarketSectionNav()
  const { hash } = useLocation()
  const activeValue = sections.find(section => section.value === hash)?.value ?? sections[0]?.value
  const options = sections.map(({ value, label }) => ({ value, label, href: `#${value}` }))
  const activateSection = useEffectEvent(() => sections.find(section => section.value === hash)?.onSelect?.())

  useEffect(() => {
    if (isMarketSectionNavEnabled) activateSection()
  }, [hash, isMarketSectionNavEnabled])

  if (!isMarketSectionNavEnabled || !sections.length) return null

  return (
    <Box
      data-testid="market-section-nav"
      sx={{
        borderBottom: '1px solid',
        borderColor: t => t.design.Tabs.UnderLined.Container_Border,
        marginBlockEnd: Spacing.lg,
        overflow: 'hidden',
      }}
    >
      <TabsSwitcher
        variant="underlined"
        size="small"
        value={activeValue}
        options={options}
        overflow="scrollable"
        hideInactiveBorders
        testIdPrefix="market-section-nav"
      />
    </Box>
  )
}
