import Fuse from 'fuse.js'
import { useCallback, useMemo, useState } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BLOCKCHAIN_LEGACY_NAMES } from '@ui/utils'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { t, Trans } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useIntegrations } from '../queries/integrations'
import { useIntegrationsTags } from '../queries/integrations-tags'
import type { Integration, Tag } from '../types'
import { IntegrationApp } from './IntegrationApp'
import { IntegrationAppTag } from './IntegrationAppTag'

const { Spacing, Sizing, ButtonSize } = SizesAndSpaces

const NetworkItem = ({ networkId }: { networkId: string }) => (
  <Stack direction="row" gap={Spacing.sm} alignItems="center">
    <ChainIcon blockchainId={networkId} size="sm" />
    <Typography>{networkId}</Typography>
  </Stack>
)

export const IntegrationsList = ({ networkId }: { networkId?: string }) => {
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations({})
  const { data: tags = {}, isLoading: integrationsTagsLoading } = useIntegrationsTags({})
  const isLoading = integrationsLoading || integrationsTagsLoading

  // Collect the unique list of networks from the integrations response
  const networks = useMemo(
    () => [
      ...new Set(
        integrations.flatMap((integration) =>
          Object.entries(integration.networks)
            .filter(([, enabled]) => enabled)
            .map(([networkId]) => networkId),
        ),
      ),
    ],
    [integrations],
  )

  const push = useNavigate()
  const searchParams = useSearchParams()

  const [searchText, setSearchText] = useState('')

  const filterTag = useMemo(() => tags?.[searchParams?.get('tag') ?? 'all']?.id, [searchParams, tags])
  const filterNetwork = useMemo(
    () => networks.find((network) => network === searchParams?.get('network')) || networkId,
    [networkId, networks, searchParams],
  )

  const updateFilters = useCallback(
    ({ tag, network }: { tag?: Tag; network?: string }) => {
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

  const integrationsFiltered = useMemo(() => {
    // Revert back to the original name if there was a chain rename, it seems the integration list was never
    // updated to use the new blockchain names like 'xdai' rather than 'gnosis'.
    const networkId =
      Object.entries(BLOCKCHAIN_LEGACY_NAMES).find(([, rename]) => rename === filterNetwork)?.[0] ?? filterNetwork

    const list = [...(integrations ?? [])]
      .filter((app) => filterTag === 'all' || app.tags[filterTag || ''])
      .filter((app) => !networkId || app.networks[networkId])

    return searchText
      ? new Fuse<Integration>(list, {
          ignoreLocation: true,
          threshold: 0.01,
          keys: [{ name: 'name', getFn: (a) => a.name }],
        })
          .search(searchText)
          .map((r) => r.item)
      : list
  }, [filterNetwork, filterTag, integrations, searchText])

  return (
    <WithSkeleton loading={isLoading} sx={{ height: Sizing.xxl }}>
      <Stack direction="column" gap={Spacing.md}>
        <Stack direction={{ mobile: 'column', tablet: 'row' }} spacing={Spacing.xs} alignItems="center">
          <Select
            aria-label={t`Select network`}
            value={filterNetwork}
            onChange={(e) => {
              updateFilters({ network: e.target.value })
            }}
            displayEmpty
            renderValue={() => <NetworkItem networkId={filterNetwork ?? 'ethereum'} />}
            sx={{ minWidth: '12rem' /* purely aesthetic */, height: ButtonSize.md }}
          >
            {networks.map((network) => (
              <MenuItem key={network} value={network}>
                <NetworkItem networkId={network} />
              </MenuItem>
            ))}
          </Select>

          <SearchField onSearch={setSearchText} placeholder={t`Search for an integration`} />
        </Stack>

        <Grid
          container
          columnSpacing={Spacing.xs}
          rowSpacing={Spacing.md}
          direction="row"
          size={{ mobile: 12, desktop: 'auto' }}
        >
          {Object.values(tags).map((tag) => (
            <Grid container key={tag.id} size={{ mobile: 12, tablet: 'auto' }} spacing={Spacing.xxs}>
              <SelectableChip
                size="small"
                label={<IntegrationAppTag tag={tag} />}
                selected={filterTag == tag.id}
                toggle={() => updateFilters({ tag: tag.id })}
                sx={{ width: { mobile: '100%', tablet: 'auto' } }}
              />
            </Grid>
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
          <Grid container spacing={Spacing.md}>
            {(integrationsFiltered ?? []).map((app) => (
              <Grid key={app.name} size={{ mobile: 12, tablet: 6, desktop: 4 }}>
                <IntegrationApp {...app} integrationsTags={tags} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </WithSkeleton>
  )
}
