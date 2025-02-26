'use client'
import type { FilterKey, FormValues } from '@/loan/components/PageIntegrations/types'
import { Trans } from '@ui-kit/lib/i18n'
import React, { useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import styled from 'styled-components'
import { ROUTE } from '@/loan/constants'
import { breakpoints, CURVE_ASSETS_URL } from '@ui/utils'
import { useFocusRing } from '@react-aria/focus'
import networks, { networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import Box from '@ui/Box'
import IntegrationAppComp from '@ui/Integration/IntegrationApp'
import SearchInput from '@ui/SearchInput'
import TableButtonFilters from '@ui/TableButtonFilters'
import TableButtonFiltersMobile from '@ui/TableButtonFiltersMobile'
import { NetworkEnum, type NetworkUrlParams } from '@/loan/types/loan.types'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import usePageOnMount from '@/loan/hooks/usePageOnMount'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { getPath } from '@/loan/utils/utilsRouter'

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
export const IntegrationsComp = (params: NetworkUrlParams) => {
  const { isFocusVisible, focusProps } = useFocusRing()
  const init = useStore((state) => state.integrations.init)
  const integrationsTags = useStore((state) => state.integrations.integrationsTags)
  const formStatus = useStore((state) => state.integrations.formStatus)
  const formValues = useStore((state) => state.integrations.formValues)
  const integrationsList = useStore((state) => state.integrations.integrationsList)
  const isXSmDown = useStore((state) => state.layout.isXSmDown)
  const results = useStore((state) => state.integrations.results)
  const setFormValues = useStore((state) => state.integrations.setFormValues)
  const searchParams = useSearchParams()
  const { push } = useRouter()
  const {
    routerParams: { rChainId },
  } = usePageOnMount(true)

  useEffect(() => {
    init(rChainId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateFormValues = useCallback(
    (updatedFormValues: Partial<FormValues>) => {
      setFormValues({ ...formValues, ...updatedFormValues }, rChainId)
    },
    [formValues, rChainId, setFormValues],
  )

  const filterKeyLabel = useMemo(() => {
    if (formValues.filterKey) {
      return integrationsTags?.[formValues.filterKey]?.displayName
    }
  }, [integrationsTags, formValues.filterKey])

  // get filterKey from url
  const parsedSearchParams = useMemo(() => {
    const searchParamsFilterKey = searchParams?.get('filter')
    let parsed: { filterKey: FilterKey } = { filterKey: 'all' }

    if (searchParamsFilterKey) {
      parsed.filterKey = (integrationsTags?.[searchParamsFilterKey]?.id ?? 'all') as FilterKey
    }

    return parsed
  }, [integrationsTags, searchParams])

  // update form if url have filter params
  useEffect(() => {
    updateFormValues({ filterKey: parsedSearchParams.filterKey })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedSearchParams.filterKey, rChainId])

  const updateRouteFilterKey = (filterKey: FilterKey) =>
    push(getPath(params, `${ROUTE.PAGE_INTEGRATIONS}?filter=${filterKey}`))

  const parsedResults = results === null ? integrationsList : results

  if (!integrationsTags) {
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    )
  }

  return (
    <>
      <Box grid gridGap={3} padding="1rem 0 2rem 0">
        <StyledSearchInput
          id="inp-search-integrations"
          className={isFocusVisible ? 'focus-visible' : ''}
          {...focusProps}
          value={formValues.searchText}
          handleInputChange={(val) => updateFormValues({ searchText: val })}
          handleSearchClose={() => updateFormValues({ searchText: '' })}
        />
        {!isXSmDown ? (
          <TableButtonFilters
            disabled={false}
            filters={integrationsTags}
            filterKey={formValues.filterKey}
            isLoading={formStatus.isLoading}
            resultsLength={results?.length}
            updateRouteFilterKey={updateRouteFilterKey}
          />
        ) : (
          <Box flex gridColumnGap={2} margin="0 0 0 1rem">
            <TableButtonFiltersMobile
              filters={integrationsTags}
              filterKey={formValues.filterKey}
              updateRouteFilterKey={updateRouteFilterKey}
            />
          </Box>
        )}
      </Box>
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
