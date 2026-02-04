import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import type { Partner } from '@ui-kit/shared/ui/PartnerCard'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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

  return fuse.search(trimmed).map((result) => result.item)
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
        alignItems="end"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={Spacing.md}
        minHeight={Sizing.xxl}
        paddingBlockEnd={Spacing.sm}
      >
        {!hideTitle && <Typography variant="headingSBold">{title}</Typography>}
        <TableSearchField
          value={searchText}
          placeholder={t`Search by bridge name`}
          onChange={setSearchText}
          toggleExpanded={toggleSearchExpanded}
          isExpanded={isExpandedOrValue}
        />
      </Stack>

      <BridgeGrid bridges={filteredBridges} sx={{ paddingBlock: Spacing.md }} />
    </Stack>
  )
}
