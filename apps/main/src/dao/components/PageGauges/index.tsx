import { useEffect, useState } from 'react'
import styled from 'styled-components'
import SubNav from '@/dao/components/SubNav'
import { SubNavItem } from '@/dao/components/SubNav/types'
import useStore from '@/dao/store/useStore'
import Box from '@ui/Box'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import GaugesList from './GaugeList'
import GaugeVoting from './GaugeVoting'
import GaugeWeightDistribution from './GaugeWeightDistribution'

const Gauges = () => {
  const { isMdUp } = useStore((state) => state.layout)
  const { wallet } = useWallet()
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
  border: none;
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
