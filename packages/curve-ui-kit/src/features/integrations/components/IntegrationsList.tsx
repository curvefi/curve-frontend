import Fuse from 'fuse.js'
import { useCallback, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { breakpoints, CURVE_ASSETS_URL, type BaseConfig } from '@ui/utils'
import { useIntegrations, useIntegrationsTags, type IntegrationApp, type Tag } from '@ui-kit/features/integrations'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { t, Trans } from '@ui-kit/lib/i18n'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { SearchField } from '@ui-kit/shared/ui/SearchField'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import IntegrationAppComp from './IntegrationApp'
import SelectNetwork from './SelectNetwork'

const { Spacing } = SizesAndSpaces

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
    () =>
      networks.find(
        ({ chainId, showInSelectNetwork }) => showInSelectNetwork && chainId == Number(searchParams?.get('chainId')),
      ),
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
    let list = [...(integrations ?? [])]
    list = filterTag === 'all' ? list : list.filter((app) => app.tags[filterTag || ''])
    list = !filterNetwork ? list : list.filter((app) => app.networks[filterNetwork.networkId])

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
    <>
      <StyledFiltersWrapper>
        <Stack direction="row" sx={{ gridArea: 'grid-search' }} spacing={2} alignItems="center">
          <SelectNetwork
            items={networks}
            minWidth="8.5em"
            selectedKey={filterNetwork?.networkId}
            onSelectionChange={(chainId) => updateFilters({ tag: filterTag, chainId: Number(chainId) })}
          />

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
                toggle={() => updateFilters({ tag: tag.id, chainId: filterNetwork?.chainId })}
                sx={{ width: { mobile: '100%', tablet: 'auto' } }}
              />
            </Grid>
          ))}
        </Grid>
      </StyledFiltersWrapper>

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
    </>
  )
}

const StyledFiltersWrapper = styled.div`
  display: grid;
  grid-row-gap: 1rem;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'grid-search'
    'grid-filters';
  margin: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: 0.5rem;
    justify-content: flex-start;
    margin: 1rem 0;
  }
`

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
