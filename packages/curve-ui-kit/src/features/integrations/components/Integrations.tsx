import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { useFocusRing } from '@react-aria/focus'
import Box from '@ui/Box'
import IntegrationAppComp from '@ui/Integration/IntegrationApp'
import SearchInput from '@ui/SearchInput'
import TableButtonFilters from '@ui/TableButtonFilters'
import TableButtonFiltersMobile from '@ui/TableButtonFiltersMobile'
import { breakpoints, CURVE_ASSETS_URL } from '@ui/utils'
import type { IntegrationApp, IntegrationsTags, Tag } from '@ui-kit/features/integrations'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useNavigate } from '@ui-kit/hooks/router'
import { Trans } from '@ui-kit/lib/i18n'

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
export const Integrations = ({
  integrationsList,
  integrationsTags,
  searchParams,
  chainId,
}: {
  integrationsList: IntegrationApp[]
  integrationsTags: IntegrationsTags
  searchParams: URLSearchParams | null
  chainId?: number
}) => {
  const { isFocusVisible, focusProps } = useFocusRing()
  const push = useNavigate()
  const isXSmDown = useLayoutStore((state) => state.isXSmDown)

  const [searchText, setSearchText] = useState('')

  // get tag key from url
  const tagFilterKey = useMemo(
    () => integrationsTags?.[searchParams?.get('tag') ?? 'all']?.id,
    [integrationsTags, searchParams],
  )

  const integrations = useMemo(() => {
    let list = [...(integrationsList ?? [])]
    list = tagFilterKey === 'all' ? list : list.filter((app) => app.tags[tagFilterKey || ''])

    if (searchText) {
      const fuse = new Fuse<IntegrationApp>(list, {
        ignoreLocation: true,
        threshold: 0.01,
        keys: [{ name: 'name', getFn: (a) => a.name }],
      })

      return fuse.search(searchText).map((r) => r.item)
    }
    return list
  }, [integrationsList, searchText, tagFilterKey])

  const updateRouteTagKey = (tagKey: Tag) => push(`?tag=${tagKey}`)

  return (
    <>
      <Box grid gridGap={3} padding="1rem 0 2rem 0">
        <StyledSearchInput
          id="inp-search-integrations"
          className={isFocusVisible ? 'focus-visible' : ''}
          {...focusProps}
          value={searchText}
          handleInputChange={(val) => setSearchText(val)}
          handleSearchClose={() => setSearchText('')}
        />
        {!isXSmDown ? (
          <TableButtonFilters
            disabled={false}
            filters={integrationsTags}
            filterKey={tagFilterKey}
            isLoading={Object.keys(integrationsTags).length === 0}
            resultsLength={integrations?.length}
            updateRouteFilterKey={updateRouteTagKey}
          />
        ) : (
          <Box flex gridColumnGap={2} margin="0 0 0 1rem">
            <TableButtonFiltersMobile
              filters={integrationsTags}
              filterKey={tagFilterKey}
              updateRouteFilterKey={updateRouteTagKey}
            />
          </Box>
        )}
      </Box>
      {!integrations.length ? (
        <NoResultWrapper flex flexJustifyContent="center" padding="3rem 0">
          <Trans>
            No integration apps found with for {searchText ? <>&ldquo;{searchText}&rdquo;</> : ''}{' '}
            {!!searchText && !!tagFilterKey ? <>and </> : ''}
            {tagFilterKey ? <>&ldquo;{tagFilterKey}&rdquo;</> : ''}
          </Trans>
        </NoResultWrapper>
      ) : (
        <IntegrationsWrapper flexAlignItems="flex-start" grid>
          {(integrations ?? []).map((app, idx) => (
            <IntegrationAppComp
              key={`${app.name}_${idx}`}
              {...app}
              filterKey={tagFilterKey}
              integrationsTags={integrationsTags}
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
