import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Key, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import SelectIntegrationTags from '@/dex/components/PageIntegrations/components/SelectIntegrationTags'
import type { FormValues } from '@/dex/components/PageIntegrations/types'
import { parseSearchParams } from '@/dex/components/PageIntegrations/utils'
import { ROUTE } from '@/dex/constants'
import useStore from '@/dex/store/useStore'
import { ChainId, NetworkEnum, type NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { useFocusRing } from '@react-aria/focus'
import Box from '@ui/Box'
import IntegrationAppComp from '@ui/Integration/IntegrationApp'
import type { IntegrationsTags } from '@ui/Integration/types'
import SearchInput from '@ui/SearchInput'
import SelectNetwork from '@ui/SelectNetwork/SelectNetwork'
import { breakpoints, CURVE_ASSETS_URL } from '@ui/utils'
import { Trans } from '@ui-kit/lib/i18n'

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
const IntegrationsComp = ({
  integrationsTags,
  params,
  rChainId,
}: {
  integrationsTags: IntegrationsTags
  params: NetworkUrlParams
  rChainId: ChainId | ''
}) => {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const { isFocusVisible, focusProps } = useFocusRing()

  const connectState = useStore((state) => state.connectState)
  const formStatus = useStore((state) => state.integrations.formStatus)
  const formValues = useStore((state) => state.integrations.formValues)
  const integrationsList = useStore((state) => state.integrations.integrationsList)
  const results = useStore((state) => state.integrations.results)
  const setFormValues = useStore((state) => state.integrations.setFormValues)
  const networks = useStore((state) => state.networks.networks)
  const visibleNetworksList = useStore((state) => state.networks.visibleNetworksList)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)

  const { filterKey, filterNetworkId } = parseSearchParams(
    searchParams,
    rChainId,
    visibleNetworksList,
    integrationsTags,
  )

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues({ ...formValues, ...updatedFormValues })
    },
    [formValues, setFormValues],
  )

  const updatePath = useCallback(
    ({ filterKey, filterNetworkId }: { filterKey?: Key; filterNetworkId?: Key }) => {
      const pSearchParams = parseSearchParams(searchParams, rChainId, visibleNetworksList, integrationsTags)
      let pathname = getPath(params, ROUTE.PAGE_INTEGRATIONS)

      // get filter Key
      let pFilterKey = filterKey ?? pSearchParams.filterKey ?? ''
      pFilterKey = pFilterKey && pFilterKey === 'all' ? '' : pFilterKey
      if (pFilterKey) pathname += `?filter=${pFilterKey}`

      // get filter NetworkId
      let pFilterNetworkId = filterNetworkId ?? pSearchParams.filterNetworkId ?? ''
      pFilterNetworkId = pFilterNetworkId && pFilterNetworkId == rChainId ? '' : pFilterNetworkId
      if (pFilterNetworkId) pathname += `${pFilterKey ? '&' : '?'}networkId=${pFilterNetworkId}`

      push(pathname)
    },
    [integrationsTags, push, params, rChainId, searchParams, visibleNetworksList],
  )

  const filterKeyLabel = useMemo(() => {
    if (formValues.filterKey) {
      return integrationsTags?.[formValues.filterKey]?.displayName
    }
  }, [integrationsTags, formValues.filterKey])

  const integrationsTagsList = useMemo(
    () => (integrationsTags ? Object.entries(integrationsTags).map(([, v]) => v) : []),
    [integrationsTags],
  )

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
            connectState={connectState}
            hideIcon
            items={visibleNetworksList}
            minWidth="8.5em"
            selectedKey={filterNetworkId}
            onSelectionChange={(filterNetworkId: Key) => updatePath({ filterNetworkId })}
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
          {(parsedResults ?? []).map((app, idx) => (
            <IntegrationAppComp
              key={`${app.name}_${idx}`}
              {...app}
              filterKey={formValues.filterKey}
              integrationsTags={integrationsTags}
              integrationsAppNetworks={
                !rChainId && (
                  <Box margin="0.25rem 0 0 0">
                    {Object.keys(app.networks).map((networkId) => {
                      if (networkId in networksIdMapper) {
                        const chainId = networksIdMapper[networkId as NetworkEnum]
                        const { name, logoSrc } = networks[chainId]
                        return <Image key={chainId} alt={name} src={logoSrc} loading="lazy" width="18" height="18" />
                      }
                      return null
                    })}
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
