import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Button from '@/ui/Button'

import GaugesList from './GaugeList'
import GaugeWeightDistribution from './GaugeWeightDistribution'
import UserBox from '../UserBox'

const Gauges = () => {
  const { isMdUp } = useStore((state) => state)

  const [navSelection, setNavSelection] = useState<GaugeListNavSelection>('Gauge List')

  useEffect(() => {
    if (isMdUp && navSelection === 'Gauge Weight Distribution') {
      setNavSelection('Gauge List')
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
          <GaugesNavigation>
            <Box>
              <GaugesNavButton
                onClick={() => setNavSelection('Gauge List')}
                variant="outlined"
                className={navSelection === 'Gauge List' ? 'active' : ''}
              >
                {t`Gauge List`}
              </GaugesNavButton>
              {navSelection === 'Gauge List' && <ActiveIndicator />}
            </Box>
            {!isMdUp && (
              <Box>
                <GaugesNavButton
                  onClick={() => setNavSelection('Gauge Weight Distribution')}
                  variant="outlined"
                  className={navSelection === 'Gauge Weight Distribution' ? 'active' : ''}
                >
                  {t`Weight Distribution`}
                </GaugesNavButton>
                {navSelection === 'Gauge Weight Distribution' && <ActiveIndicator />}
              </Box>
            )}
            <Box>
              <GaugesNavButton
                onClick={() => setNavSelection('Gauge Voting')}
                variant="outlined"
                className={navSelection === 'Gauge Voting' ? 'active' : ''}
              >
                {t`Gauge Voting`}
              </GaugesNavButton>
              {navSelection === 'Gauge Voting' && <ActiveIndicator />}
            </Box>
          </GaugesNavigation>
          {navSelection === 'Gauge List' && <GaugesList />}
          {navSelection === 'Gauge Weight Distribution' && <GaugeWeightDistribution />}
          {/* {navSelection === 'Gauge Voting' && <GaugeVoting />} */}
        </Container>
        <Box flex flexColumn flexGap={'var(--spacing-1)'}>
          {navSelection === 'Gauge Voting' && (
            <Box variant="secondary">
              <UserBox snapshotVotingPower={false} />
            </Box>
          )}
          {navSelection === 'Gauge List' && isMdUp && <GaugeWeightDistribution />}
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
