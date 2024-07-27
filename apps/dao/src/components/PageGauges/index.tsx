import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Button from '@/ui/Button'

import GaugesList from './GaugeList'
import GaugeWeightDistribution from './GaugeWeightDistribution'
import UserBox from '../UserBox'
import SubNav from '@/components/SubNav'

const Gauges = () => {
  const { isMdUp } = useStore((state) => state)

  const [navSelection, setNavSelection] = useState('gaugeList')

  const navItems = !isMdUp
    ? [
        { key: 'gaugeList', label: t`Gauge List` },
        { key: 'gaugeWeightDistribution', label: t`Weight Distribution` },
        { key: 'gaugeVoting', label: t`Gauge Voting` },
      ]
    : [
        { key: 'gaugeList', label: t`Gauge List` },
        { key: 'gaugeVoting', label: t`Gauge Voting` },
      ]

  useEffect(() => {
    if (isMdUp && navSelection === 'gaugeWeightDistribution') {
      setNavSelection('gaugeList')
    }
  }, [isMdUp, navSelection])

  return (
    <Wrapper>
      <PageTitle>{t`Curve Gauges`}</PageTitle>
      <Box
        grid
        gridTemplateColumns={isMdUp ? (navSelection === 'Gauge List' ? 'auto 25rem' : 'auto 20rem') : 'auto'}
        fillWidth
        flexGap={'var(--spacing-1)'}
      >
        <Container variant="secondary">
          <SubNav activeKey={navSelection} navItems={navItems} setNavChange={setNavSelection} />
          {navSelection === 'gaugeList' && <GaugesList />}
          {navSelection === 'gaugeWeightDistribution' && <GaugeWeightDistribution />}
          {/* {navSelection === 'Gauge Voting' && <GaugeVoting />} */}
        </Container>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          {navSelection === 'gaugeVoting' && (
            <Box variant="secondary">
              <UserBox snapshotVotingPower={false} />
            </Box>
          )}
          {navSelection === 'gaugeList' && isMdUp && <GaugeWeightDistribution />}
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

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const Container = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`

const GaugesNavigation = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  border-bottom: 1px solid var(--gray-500a20);
  background-color: var(--box_header--secondary--background-color);
`

const GaugesNavButton = styled(Button)`
  border: none;
  font-size: var(--font-size-2);
  font-family: var(--font);
  text-transform: none;
  font-weight: var(--bold);
  line-break: break-spaces;
  &:hover {
    background-color: var(--box--secondary--background-color);
  }
`

const ActiveIndicator = styled.div`
  background-color: var(--primary-400);
  width: calc(100%);
  height: 2px;
  transform: translateY(calc(var(--spacing-2) + 1px));
`

export default Gauges
