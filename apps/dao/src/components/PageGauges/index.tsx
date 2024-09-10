import { SubNavItem } from '@/components/SubNav/types'

import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { useConnectWallet } from '@/onboard'

import Box from '@/ui/Box'

import GaugesList from './GaugeList'
import GaugeWeightDistribution from './GaugeWeightDistribution'
import GaugeVoting from './GaugeVoting'
import SubNav from '@/components/SubNav'

const Gauges = () => {
  const { isMdUp } = useStore((state) => state)
  const [{ wallet }] = useConnectWallet()
  const userAddress = wallet?.accounts[0].address

  const [navSelection, setNavSelection] = useState('gaugeList')

  const navItems: SubNavItem[] = [
    { key: 'gaugeList', label: t`Gauges` },
    { key: 'gaugeVoting', label: t`Voting` },
  ]

  useEffect(() => {
    if (isMdUp && navSelection === 'gaugeWeightDistribution') {
      setNavSelection('gaugeList')
    }
  }, [isMdUp, navSelection])

  return (
    <Wrapper>
      <Box flex flexColumn fillWidth flexGap={'var(--spacing-3)'}>
        <GaugeWeightDistribution isUserVotes={navSelection === 'gaugeVoting'} userAddress={userAddress} />
        <Box>
          <SubNav activeKey={navSelection} navItems={navItems} setNavChange={setNavSelection} />
          <Container variant="secondary">
            {navSelection === 'gaugeList' && <GaugesList />}
            {navSelection === 'gaugeVoting' && <GaugeVoting userAddress={userAddress} />}
          </Container>
        </Box>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-7);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 36.875rem) {
    max-width: 95%;
  }
`

const Container = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: none;
`

export default Gauges
