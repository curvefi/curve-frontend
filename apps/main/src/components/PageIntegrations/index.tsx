import type { FormValues } from '@/components/PageIntegrations/types'
import type { IntegrationsTags } from '@/ui/Integration/types'
import type { NavigateFunction, Params } from 'react-router'

import { useFocusRing } from '@react-aria/focus'
import { Trans } from '@lingui/macro'
import styled from 'styled-components'
import React, { useCallback, useEffect, useMemo } from 'react'

import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils'
import { getPath } from '@/utils/utilsRouter'
import { parseSearchParams } from '@/components/PageIntegrations/utils'
import networks, { networksIdMapper, visibleNetworksList } from '@/networks'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import IntegrationAppComp from '@/ui/Integration/IntegrationApp'
import SearchInput from '@/ui/SearchInput'
import SelectNetwork from '@/ui/Select/SelectNetwork'
import SelectIntegrationTags from '@/components/PageIntegrations/components/SelectIntegrationTags'

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
const IntegrationsComp = ({
  integrationsTags,
  navigate,
  params,
  rChainId,
  searchParams,
}: {
  integrationsTags: IntegrationsTags
  navigate: NavigateFunction
  params: Params
  rChainId: ChainId | ''
  searchParams: URLSearchParams
}) => {
  const { isFocusVisible, focusProps } = useFocusRing()

  const connectState = useStore((state) => state.connectState)
  const formStatus = useStore((state) => state.integrations.formStatus)
  const formValues = useStore((state) => state.integrations.formValues)
  const integrationsList = useStore((state) => state.integrations.integrationsList)
  const results = useStore((state) => state.integrations.results)
  const setFormValues = useStore((state) => state.integrations.setFormValues)

  const { filterKey, filterNetworkId } = parseSearchParams(searchParams, rChainId, integrationsTags)

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues({ ...formValues, ...updatedFormValues })
    },
    [formValues, setFormValues]
  )

  const updatePath = useCallback(
    ({ filterKey, filterNetworkId }: { filterKey?: React.Key; filterNetworkId?: React.Key }) => {
      const pSearchParams = parseSearchParams(searchParams, rChainId, integrationsTags)
      let pathname = getPath(params, `${ROUTE.PAGE_INTEGRATIONS}`)

      // get filter Key
      let pFilterKey = filterKey ?? pSearchParams.filterKey ?? ''
      pFilterKey = pFilterKey && pFilterKey === 'all' ? '' : pFilterKey
      if (pFilterKey) pathname += `?filter=${pFilterKey}`

      // get filter NetworkId
      let pFilterNetworkId = filterNetworkId ?? pSearchParams.filterNetworkId ?? ''
      pFilterNetworkId = pFilterNetworkId && pFilterNetworkId == rChainId ? '' : pFilterNetworkId
      if (pFilterNetworkId) pathname += `${pFilterKey ? '&' : '?'}networkId=${pFilterNetworkId}`

      navigate(pathname)
    },
    [integrationsTags, navigate, params, rChainId, searchParams]
  )

  const filterKeyLabel = useMemo(() => {
    if (formValues.filterKey) {
      return integrationsTags?.[formValues.filterKey]?.displayName
    }
  }, [integrationsTags, formValues.filterKey])

  const integrationsTagsList = useMemo(() => {
    return integrationsTags ? Object.entries(integrationsTags).map(([, v]) => v) : []
  }, [integrationsTags])

  // update form if url have filter params
  useEffect(() => {
    updateFormValues({ filterKey, filterNetworkId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, filterNetworkId])

  const parsedResults = results === null ? integrationsList : results

  return (
    <>
      <StyledFiltersWrapper>
        <Box gridArea="search" fillWidth>
          <StyledSearchInput
            id="inp-search-integrations"
            className={isFocusVisible ? 'focus-visible' : ''}
            {...focusProps}
            value={formValues.searchText}
            handleInputChange={(val) => updateFormValues({ searchText: val })}
            handleSearchClose={() => updateFormValues({ searchText: '' })}
          />
        </Box>
        <Box grid gridArea="filters" flexJustifyContent="flex-start" gridAutoFlow="column" gridGap={2}>
          <SelectIntegrationTags
            integrationsTagsList={integrationsTagsList}
            filterKey={filterKey}
            formStatus={formStatus}
            updatePath={updatePath}
          />
          <SelectNetwork
            hideIcon
            items={visibleNetworksList}
            minWidth="8.5em"
            selectedKey={filterNetworkId}
            onSelectionChange={(filterNetworkId: React.Key) => updatePath({ filterNetworkId })}
            onSelectionDelete={
              filterNetworkId && +filterNetworkId !== rChainId
                ? () => updatePath({ filterNetworkId: rChainId })
                : undefined
            }
          />
        </Box>
      </StyledFiltersWrapper>
      {formStatus.noResult ? (
        <NoResultWrapper flex flexJustifyContent="center" padding="3rem 0">
          <Trans>
            No integration apps found with for{' '}
            {!!formValues.searchText ? <>&ldquo;{formValues.searchText}&rdquo;</> : ''}{' '}
            {!!formValues.searchText && !!filterKeyLabel ? <>and </> : ''}
            {!!filterKeyLabel ? <>&ldquo;{filterKeyLabel}&rdquo;</> : ''}
          </Trans>
        </NoResultWrapper>
      ) : (
        <IntegrationsWrapper flexAlignItems="flex-start" grid>
          {(parsedResults ?? []).map((app, idx) => {
            return (
              <IntegrationAppComp
                key={`${app.name}_${idx}`}
                {...app}
                filterKey={formValues.filterKey}
                integrationsTags={integrationsTags}
                integrationsAppNetworks={
                  !rChainId && (
                    <Box margin="0.25rem 0 0 0">
                      {Object.keys(app.networks).map((network) => {
                        const networkName = network as NetworkEnum
                        if (networkName in networksIdMapper) {
                          const chainId = networksIdMapper[networkName]
                          const Icon = networks[chainId].icon
                          return (
                            <Icon
                              key={networkName}
                              aria-label={networkName}
                              title={networkName}
                              width="18"
                              height="18"
                            />
                          )
                        }
                        return null
                      })}
                    </Box>
                  )
                }
                imageUrl={app.imageId ? `${networks[rChainId || '1'].integrations.imageBaseurl}/${app.imageId}` : ''}
              />
            )
          })}
        </IntegrationsWrapper>
      )}
    </>
  )
}

const StyledFiltersWrapper = styled.div`
  display: grid;
  grid-row-gap: 1rem;
  grid-template-areas:
    'grid-search'
    'grid-filters';
  margin: 1rem;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: 0.5rem;
    grid-template-columns: auto 1fr;
    grid-template-areas: 'grid-filters grid-search';
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
  min-height: var(--height-large);

  button {
    min-height: 100%;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    min-height: 100%;
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

export default IntegrationsComp
