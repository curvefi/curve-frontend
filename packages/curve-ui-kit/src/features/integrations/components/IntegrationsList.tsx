import Fuse from 'fuse.js'
import { useCallback, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { BLOCKCHAIN_LEGACY_NAMES, breakpoints, CURVE_ASSETS_URL, type BaseConfig } from '@ui/utils'
import { useIntegrations, useIntegrationsTags, type IntegrationApp, type Tag } from '@ui-kit/features/integrations'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { t, Trans } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import IntegrationAppComp from './IntegrationApp'

const { Spacing, ButtonSize } = SizesAndSpaces

const NetworkItem = ({ network }: { network?: BaseConfig }) => (
  <Stack direction="row" gap={Spacing.sm} alignItems="center">
    {network && <ChainIcon blockchainId={network.networkId} size="sm" />}
    <Typography>{network ? network.name : '?'}</Typography>
  </Stack>
)

export type IntegrationsListProps = { chainId?: number; networks: BaseConfig[] }

export const IntegrationsList = ({ chainId, networks }: IntegrationsListProps) => {
  const { data: integrations = [], isLoading: integrationsLoading } = useIntegrations({})
  const { data: tags = {}, isLoading: integrationsTagsLoading } = useIntegrationsTags({})
  const isLoading = integrationsLoading || integrationsTagsLoading

  const push = useNavigate()
  const searchParams = useSearchParams()

  const [searchText, setSearchText] = useState('')

  const filterTag = useMemo(() => tags?.[searchParams?.get('tag') ?? 'all']?.id, [searchParams, tags])
  const filterNetwork = useMemo(
    () => networks.find((network) => network.chainId === Number(searchParams?.get('chainId') || chainId)),
    [searchParams, networks],
  )

  const updateFilters = useCallback(
    ({ tag, chainId }: { tag?: Tag; chainId?: number }) => {
      const pTag = tag ?? filterTag
      const pChainId = chainId ?? filterNetwork?.chainId ?? ''

      push(
        `?${new URLSearchParams({
          ...(pTag && { tag: pTag.toString() }),
          ...(pChainId && { chainId: pChainId.toString() }),
        })}`,
      )
    },
    [filterTag, filterNetwork, push],
  )

  const integrationsFiltered = useMemo(() => {
    // Revert back to the original name if there was a chain rename, it seems the integration list was never
    // updated to use the new blockchain names like 'xdai' rather than 'gnosis'.
    const networkId =
      Object.entries(BLOCKCHAIN_LEGACY_NAMES).find(([, rename]) => rename === filterNetwork?.networkId)?.[0] ??
      filterNetwork?.networkId

    let list = [...(integrations ?? [])]
    list = filterTag === 'all' ? list : list.filter((app) => app.tags[filterTag || ''])
    list = networkId ? list.filter((app) => app.networks[networkId]) : list

    return searchText
      ? new Fuse<IntegrationApp>(list, {
          ignoreLocation: true,
          threshold: 0.01,
          keys: [{ name: 'name', getFn: (a) => a.name }],
        })
          .search(searchText)
          .map((r) => r.item)
      : list
  }, [filterNetwork, filterTag, integrations, searchText])

  return isLoading ? (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  ) : (
    <Stack direction="column" gap={Spacing.md}>
      <Stack direction={{ mobile: 'column', tablet: 'row' }} spacing={Spacing.xs} alignItems="center">
        <Select
          aria-label={t`Select network`}
          value={filterNetwork?.chainId}
          onChange={(e) => {
            updateFilters({ chainId: Number(e.target.value) })
          }}
          displayEmpty
          renderValue={() => <NetworkItem network={filterNetwork} />}
          sx={{ minWidth: '12rem', height: ButtonSize.md }}
        >
          {networks.map((network) => (
            <MenuItem key={network.chainId} value={network.chainId}>
              <NetworkItem network={network} />
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
              label={
                <Stack direction="row" alignItems="center" gap={Spacing.xs}>
                  <Icon size={16} name="StopFilledAlt" fill={tag.color} strokeWidth="1px" stroke="white" />
                  {tag.displayName}
                </Stack>
              }
              selected={filterTag == tag.id}
              toggle={() => updateFilters({ tag: tag.id })}
              sx={{ width: { mobile: '100%', tablet: 'auto' } }}
            />
          </Grid>
        ))}
      </Grid>

      {!integrations.length ? (
        <NoResultWrapper flex flexJustifyContent="center" padding="3rem 0">
          <Trans>
            No integration apps found with for {searchText ? <>&ldquo;{searchText}&rdquo;</> : ''}{' '}
            {!!searchText && !!filterTag ? <>and </> : ''}
            {filterTag ? <>&ldquo;{filterTag}&rdquo;</> : ''}
          </Trans>
        </NoResultWrapper>
      ) : (
        <IntegrationsWrapper flexAlignItems="flex-start" grid>
          {(integrationsFiltered ?? []).map((app, idx) => (
            <IntegrationAppComp
              key={`${app.name}_${idx}`}
              {...app}
              filterKey={filterTag}
              integrationsTags={tags}
              integrationsAppNetworks={
                chainId && (
                  <Stack direction="row" gap={Spacing.xs}>
                    {Object.keys(app.networks).map((networkId) => (
                      <ChainIcon key={networkId} blockchainId={networkId} size="sm" />
                    ))}
                  </Stack>
                )
              }
              imageUrl={app.imageId ? `${CURVE_ASSETS_URL}/platforms/${app.imageId}` : ''}
            />
          ))}
        </IntegrationsWrapper>
      )}
    </Stack>
  )
}

const IntegrationsWrapper = styled(Box)`
  justify-content: center;
  padding-bottom: 1.5rem;
  grid-template-columns: 1fr;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${breakpoints.md}rem) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`

const NoResultWrapper = styled(Box)`
  margin-left: 1rem;
  margin-right: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-left: 0;
    margin-right: 0;
  }
`
