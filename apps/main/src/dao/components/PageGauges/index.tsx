import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import Box from '@ui/Box'
import { useLayoutStore } from '@ui-kit/features/layout'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import GaugesList from './GaugeList'
import GaugeVoting from './GaugeVoting'
import GaugeWeightDistribution from './GaugeWeightDistribution'

const tabs = [
  { value: 'gaugeList', label: t`Gauges` },
  { value: 'gaugeVoting', label: t`Voting` },
] as const

const Gauges = () => {
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const { address: userAddress } = useAccount()

  const [navSelection, setNavSelection] = useState('gaugeList')

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
          <TabsSwitcher
            variant="contained"
            size="medium"
            value={navSelection}
            onChange={setNavSelection}
            options={tabs}
          />

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
