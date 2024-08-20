import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { breakpoints } from '@/ui/utils/responsive'
import useStore from '@/store/useStore'

import { providers } from 'ethers'

import { PEG_KEEPERS, REFRESH_INTERVAL } from '@/constants'
import { usePageVisibleInterval } from '@/ui/hooks'
import networks from '@/networks'

import PegKeeperContent from '@/components/PagePegKeepers/components/PegKeeperContent'

const PagePegKeepers = ({ rChainId }: { rChainId: ChainId }) => {
  const isPageVisible = useStore((state) => state.isPageVisible)
  const fetchDetails = useStore((state) => state.pegKeepers.fetchDetails)
  const getProvider = useStore((state) => state.wallet.getProvider)
  const resetState = useStore((state) => state.pegKeepers.resetState)

  const [loaded, setLoaded] = useState(false)

  const { rpcUrl } = networks[rChainId]
  const provider = useMemo(() => getProvider('') || new providers.JsonRpcProvider(rpcUrl), [getProvider, rpcUrl])

  useEffect(() => {
    if (provider) {
      fetchDetails(provider)
      setLoaded(true)
    }
  }, [fetchDetails, provider])

  usePageVisibleInterval(
    () => {
      if (!loaded) return

      resetState()
      if (provider) fetchDetails(provider)
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible
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
