import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { EmptyStateEvmCard } from '@evm-ui/shared/ui/EmptyStateEvmCard'
import type { Partner } from '@evm-ui/shared/ui/PartnerCard'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SearchField } from '@ui/components/SearchField'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
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
  const filteredBridges = useMemo(() => filterBridges(searchText, bridges), [bridges, searchText])

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
        {!useIsMobile() && <Typography variant="headingSBold">{title}</Typography>}
        <SearchField value={searchText} placeholder={t`Search by bridge name`} onSearch={setSearchText} />
      </Stack>
      {filteredBridges.length ? (
        <BridgeGrid bridges={filteredBridges} sx={{ paddingBlock: Spacing.md }} />
      ) : (
        <Stack sx={{ paddingBlock: Spacing.md, alignItems: 'center' }}>
          <EmptyStateEvmCard
            title={t`No bridges found`}
            description={t`Try adjusting your search query`}
            button={{ label: t`Clear search`, onClick: () => setSearchText('') }}
          />
        </Stack>
      )}
    </Stack>
  )
}
