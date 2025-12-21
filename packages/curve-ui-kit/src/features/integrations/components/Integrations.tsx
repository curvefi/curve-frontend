import Fuse from 'fuse.js'
import { useCallback, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import Stack from '@mui/material/Stack'
import { useFocusRing } from '@react-aria/focus'
import Box from '@ui/Box'
import SearchInput from '@ui/SearchInput'
import TableButtonFilters from '@ui/TableButtonFilters'
import TableButtonFiltersMobile from '@ui/TableButtonFiltersMobile'
import { breakpoints, CURVE_ASSETS_URL, type BaseConfig } from '@ui/utils'
import type { IntegrationApp, IntegrationsTags, Tag } from '@ui-kit/features/integrations'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'
import { Trans } from '@ui-kit/lib/i18n'
import IntegrationAppComp from './IntegrationApp'
import SelectNetwork from './SelectNetwork'

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
export const Integrations = ({
  integrations,
  tags: tags,
  networks,
  chainId,
}: {
  integrations: IntegrationApp[]
  tags: IntegrationsTags
  networks: BaseConfig[]
  chainId?: number
}) => {
  const push = useNavigate()
  const searchParams = useSearchParams()
  const { isFocusVisible, focusProps } = useFocusRing()
  const isXSmDown = useLayoutStore((state) => state.isXSmDown)

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

  return (
    <>
      <StyledFiltersWrapper>
        <Stack direction="row" sx={{ gridArea: 'grid-search' }} spacing={2} alignItems="center">
          <SelectNetwork
            items={networks}
            minWidth="8.5em"
            selectedKey={filterNetwork?.networkId}
            onSelectionChange={(chainId) => updateFilters({ tag: filterTag, chainId: Number(chainId) })}
          />

          <StyledSearchInput
            id="inp-search-integrations"
            className={isFocusVisible ? 'focus-visible' : ''}
            {...focusProps}
            value={searchText}
            handleInputChange={(val) => setSearchText(val)}
            handleSearchClose={() => setSearchText('')}
          />
        </Stack>

        <Box grid gridArea="filters" flexJustifyContent="flex-start" gridAutoFlow="column" gridGap={2}>
          {!isXSmDown ? (
            <TableButtonFilters
              disabled={false}
              filters={tags}
              filterKey={filterTag}
              isLoading={Object.keys(tags).length === 0}
              resultsLength={integrations?.length}
              updateRouteFilterKey={(tag) => updateFilters({ tag: tag as Tag, chainId: filterNetwork?.chainId })}
            />
          ) : (
            <Box flex gridColumnGap={2} margin="0 0 0 1rem">
              <TableButtonFiltersMobile
                filters={tags}
                filterKey={filterTag}
                updateRouteFilterKey={(tag) => updateFilters({ tag: tag as Tag, chainId: filterNetwork?.chainId })}
              />
            </Box>
          )}
        </Box>
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
                  <Box margin="0.25rem 0 0 0">
                    {Object.keys(app.networks).map((networkId) => (
                      <img
                        key={networkId}
                        alt={`${networkId} logo`}
                        src={networkId}
                        loading="lazy"
                        width="18"
                        height="18"
                      />
                    ))}
                  </Box>
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

const StyledSearchInput = styled(SearchInput)`
  flex-grow: 1;
  margin-left: 1rem;
  margin-right: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    margin-left: 0;
    margin-right: 0;
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
