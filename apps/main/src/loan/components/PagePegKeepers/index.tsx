import { useEffect, useState } from 'react'
import styled from 'styled-components'
import PegKeeperContent from '@/loan/components/PagePegKeepers/components/PegKeeperContent'
import { PEG_KEEPERS } from '@/loan/constants'
import useStore from '@/loan/store/useStore'
import { ChainId, Provider } from '@/loan/types/loan.types'
import { breakpoints } from '@ui/utils/responsive'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const PagePegKeepers = ({ rChainId, provider }: { rChainId: ChainId; provider: Provider }) => {
  const isPageVisible = useStore((state) => state.isPageVisible)
  const fetchDetails = useStore((state) => state.pegKeepers.fetchDetails)
  const resetState = useStore((state) => state.pegKeepers.resetState)

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (provider) {
      void fetchDetails(provider)
      setLoaded(true)
    }
  }, [fetchDetails, provider])

  usePageVisibleInterval(
    () => {
      if (!loaded) return

      resetState()
      if (provider) void fetchDetails(provider)
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  return (
    <Wrapper>
      {Object.entries(PEG_KEEPERS).map(([k, pegKeeperContent], idx) => (
        <PegKeeperContent key={`pegKeeper${idx}`} {...pegKeeperContent} rChainId={rChainId} pegKeeperAddress={k} />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  grid-gap: var(--spacing-normal);

  @media (min-width: ${breakpoints.xs}rem) {
    flex-direction: row;
    flex-wrap: wrap;
  }
`

export default PagePegKeepers
