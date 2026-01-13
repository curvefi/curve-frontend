import Fuse from 'fuse.js'
import { useCallback, useMemo } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { BLOCKCHAIN_LEGACY_NAMES } from '@ui/utils'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { t, Trans } from '@ui-kit/lib/i18n'
import { ChainFilterChips } from '@ui-kit/shared/ui/DataTable/chips/ChainFilterChips'
import { PartnerCard, type Partner } from '@ui-kit/shared/ui/PartnerCard'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useIntegrations } from '../queries/integrations'
import { useIntegrationsTags } from '../queries/integrations-tags'

const { Spacing, Sizing } = SizesAndSpaces

const filterIntegrations = ({
  integrations,
  network,
  tag,
  searchText,
}: {
  integrations: Partner[]
  network: string
  tag: string
  searchText?: string
}): Partner[] => {
  // Revert back to the original name if there was a chain rename, it seems the integration list was never
  // updated to use the new blockchain names like 'xdai' rather than 'gnosis'.
  const networkId = Object.entries(BLOCKCHAIN_LEGACY_NAMES).find(([, rename]) => rename === network)?.[0] ?? network

  const list = [...integrations]
    .filter((app) => tag === 'all' || app.tags?.includes(tag))
    .filter((app) => !networkId || app.networks?.[networkId])

  if (!searchText) {
    return list
  }

  return new Fuse<Partner>(list, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: [{ name: 'name', getFn: (a) => a.name }],
  })
    .search(searchText)
    .map((r) => r.item)
}

export const IntegrationsList = ({ networkId, searchText }: { networkId?: string; searchText?: string }) => {
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations({})
  const { data: tags = {}, isLoading: integrationsTagsLoading } = useIntegrationsTags({})
  const isLoading = integrationsLoading || integrationsTagsLoading

  // Collect the unique list of networks from the integrations response
  const networks = useMemo(
    () => [
      ...new Set(
        integrations.flatMap((integration) =>
          Object.entries(integration.networks ?? [])
            .filter(([, enabled]) => enabled)
            .map(([networkId]) => networkId),
        ),
      ),
    ],
    [integrations],
  )

  const push = useNavigate()
  const searchParams = useSearchParams()

  const filterTag = useMemo(() => tags?.[searchParams?.get('tag') ?? 'all']?.id, [searchParams, tags])
  const filterNetwork = useMemo(
    () => (networks.find((network) => network === searchParams?.get('network')) || networkId) ?? 'ethereum',
    [networkId, networks, searchParams],
  )

  const updateFilters = useCallback(
    ({ tag, network }: { tag?: string; network?: string }) => {
      const pTag = tag ?? filterTag
      const pNetwork = network ?? filterNetwork

      push(
        `?${new URLSearchParams({
          ...(pTag && { tag: pTag.toString() }),
          ...(pNetwork && { network: pNetwork.toString() }),
        })}`,
      )
    },
    [filterTag, filterNetwork, push],
  )

  const integrationsFiltered = useMemo(
    () => filterIntegrations({ integrations, network: filterNetwork, tag: filterTag, searchText }),
    [filterNetwork, filterTag, integrations, searchText],
  )

  return (
    <WithSkeleton loading={isLoading} sx={{ height: Sizing.xxl }}>
      <Stack direction="column" gap={Spacing.sm}>
        <ChainFilterChips
          chains={networks}
          selectedChains={[filterNetwork]}
          toggleChain={(network) => {
            updateFilters({ network })
          }}
        />

        <Grid
          container
          columnSpacing={Spacing.xs}
          rowSpacing={Spacing.xs}
          direction="row"
          size={{ mobile: 12, desktop: 'auto' }}
        >
          {Object.values(tags).map((tag) => (
            <SelectableChip
              key={tag.id}
              size="small"
              label={
                <Stack direction="row" alignItems="center" gap={Spacing.sm}>
                  {tag.color && <Box sx={{ width: Sizing.xs, height: Sizing.xs, backgroundColor: tag.color }} />}
                  {tag.displayName}
                </Stack>
              }
              selected={filterTag == tag.id}
              toggle={() => updateFilters({ tag: tag.id })}
              sx={{ width: { mobile: 'auto' } }}
            />
          ))}
        </Grid>

        {!integrationsFiltered.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: Spacing.xxl }}>
            <Trans>
              No integration apps found with for{' '}
              {notFalsy(searchText, filterTag)
                .map((x) => `“${x}”`)
                .join(t` and `)}
            </Trans>
          </Box>
        ) : (
          <Grid container spacing={Spacing.md} sx={{ marginBlockStart: Spacing.sm }}>
            {(integrationsFiltered ?? []).map((app) => (
              <Grid key={app.name} size={{ mobile: 12, tablet: 6, desktop: 4 }}>
                <PartnerCard {...app} tags={(app.tags ?? []).map((tag) => tags[tag]?.displayName ?? tag)} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </WithSkeleton>
  )
}
