import styled from 'styled-components'
import { useMemo } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Spinner from '../../Spinner'
import ErrorMessage from '@/components/ErrorMessage'
import FeesBarChart from './FeesBarChart'

const VeCrvFeesChart: React.FC = () => {
  const { veCrvFees, getVeCrvFees } = useStore((state) => state.vecrv)

  const feesLoading = veCrvFees.fetchStatus === 'LOADING'
  const feesError = veCrvFees.fetchStatus === 'ERROR'
  const feesReady = veCrvFees.fetchStatus === 'SUCCESS'

  const reverseOrderFees = useMemo(() => {
    if (!feesReady || veCrvFees.fees.length === 0) return []

    return [...veCrvFees.fees].reverse().slice(-100)
  }, [feesReady, veCrvFees.fees])

  return (
    <Wrapper>
      <TitleRow>
        <BoxTitle>{t`veCRV Fees Last 100 Weeks`}</BoxTitle>
      </TitleRow>
      <Content>
        {feesLoading && <Spinner height="31.25rem" />}
        {feesError && <ErrorMessage message={t`Error fetching veCRV fees data`} onClick={getVeCrvFees} />}
        {feesReady && <FeesBarChart data={reverseOrderFees} />}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
  margin-bottom: auto;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
`

const BoxTitle = styled.h4`
  font-size: var(--font-size-3);
  font-weight: bold;
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`

export default VeCrvFeesChart
