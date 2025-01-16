import { SubNavItem } from '@/dao/components/SubNav/types'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/dao/store/useStore'

import CrvStats from './CrvStats'
import VeCrvFees from './VeCrvFeesTable'
import DailyLocks from './DailyLocksChart'
import TopHolders from './TopHoldersChart'
import HoldersTable from './HoldersTable'
import SubNav from '../SubNav'
import Box from '@ui/Box'

type AnalyticsNavSelection = 'fees' | 'holders' | 'locks'

const Analytics: React.FC = () => {
  const { getVeCrvHolders, veCrvHolders } = useStore((state) => state.analytics)
  const [navSelection, setNavSelection] = useState<AnalyticsNavSelection>('fees')

  const navItems: SubNavItem[] = [
    { key: 'fees', label: t`veCRV Fees` },
    { key: 'holders', label: t`Holders` },
    { key: 'locks', label: t`Locks` },
  ]

  useEffect(() => {
    if (veCrvHolders.topHolders.length === 0 && veCrvHolders.fetchStatus !== 'ERROR') {
      getVeCrvHolders()
    }
  }, [getVeCrvHolders, veCrvHolders.topHolders.length, veCrvHolders.fetchStatus])

  return (
    <Wrapper>
      <Box flex flexColumn fillWidth flexGap={'var(--spacing-3)'}>
        <CrvStats />
        <Box>
          <SubNav
            activeKey={navSelection}
            navItems={navItems}
            setNavChange={setNavSelection as (key: string) => void}
            nested
          />
          <Container variant="secondary">
            {navSelection === 'fees' && <VeCrvFees />}
            {navSelection === 'holders' && (
              <Box flex flexColumn flexGap="var(--spacing-2)">
                <TopHolders />
                <HoldersTable />
              </Box>
            )}
            {navSelection === 'locks' && <DailyLocks />}
          </Container>
        </Box>
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
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

export default Analytics
