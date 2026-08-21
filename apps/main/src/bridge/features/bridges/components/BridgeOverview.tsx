import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { LegacyTableSearchField } from '@evm-ui/shared/ui/DataTable/LegacyTableSearchField'
import { EmptyStateCard } from '@evm-ui/shared/ui/EmptyStateCard'
import type { Partner } from '@evm-ui/shared/ui/PartnerCard'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BridgeGrid } from './BridgeGrid'

const { Spacing, Sizing } = SizesAndSpaces

function filterBridges<T extends Partner>(searchText: string, bridges: T[]): T[] {
  const trimmed = searchText.trim()
  if (!trimmed) return bridges

  const fuse = new Fuse(bridges, {
    ignoreLocation: true,
    ignoreDiacritics: true,
    isCaseSensitive: false,
    threshold: 0.01,
    keys: ['name'],
  })

  return fuse.search(trimmed).map(result => result.item)
}

export const BridgeOverview = ({ bridges, title }: { bridges: Partner[]; title: string }) => {
  const [searchText, setSearchText] = useState('')
  const [isSearchExpanded, , , toggleSearchExpanded] = useSwitch(false)
  const isExpandedOrValue = Boolean(isSearchExpanded || searchText)
  const isMobile = useIsMobile()

  const filteredBridges = useMemo(() => filterBridges(searchText, bridges), [bridges, searchText])
  const hideTitle = isExpandedOrValue && isMobile

  return (
    <Stack>
      <Stack
        direction="row"
        sx={{
          alignItems: 'end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: Spacing.md,
          minHeight: Sizing.xxl,
          paddingBlockEnd: Spacing.sm,
        }}
      >
        {!hideTitle && <Typography variant="headingSBold">{title}</Typography>}
        <LegacyTableSearchField
          value={searchText}
          placeholder={t`Search by bridge name`}
          onChange={setSearchText}
          toggleExpanded={toggleSearchExpanded}
          isExpanded={isExpandedOrValue}
        />
      </Stack>
      {filteredBridges.length ? (
        <BridgeGrid bridges={filteredBridges} sx={{ paddingBlock: Spacing.md }} />
      ) : (
        <Stack sx={{ paddingBlock: Spacing.md, alignItems: 'center' }}>
          <EmptyStateCard
            title={t`No bridges found`}
            description={t`Try adjusting your search query`}
            button={{ label: t`Clear search`, onClick: () => setSearchText('') }}
          />
        </Stack>
      )}
    </Stack>
  )
}
