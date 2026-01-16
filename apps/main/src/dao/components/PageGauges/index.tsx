import { useState } from 'react'
import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { GaugesList } from './GaugeList'
import { GaugeVoting } from './GaugeVoting'
import { GaugeWeightDistribution } from './GaugeWeightDistribution'

type Tab = 'gaugeList' | 'gaugeVoting'
const tabs: TabOption<Tab>[] = [
  { value: 'gaugeList', label: t`Gauges` },
  { value: 'gaugeVoting', label: t`Voting` },
]

export const Gauges = () => {
  const [tab, setTab] = useState<Tab>('gaugeList')

  return (
    <Wrapper>
      <Box flex flexColumn fillWidth flexGap={'var(--spacing-3)'}>
        <GaugeWeightDistribution isUserVotes={tab === 'gaugeVoting'} />
        <Box>
          <TabsSwitcher variant="contained" value={tab} onChange={setTab} options={tabs} />

          <Container variant="secondary">
            {tab === 'gaugeList' && <GaugesList />}
            {tab === 'gaugeVoting' && <GaugeVoting />}
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
