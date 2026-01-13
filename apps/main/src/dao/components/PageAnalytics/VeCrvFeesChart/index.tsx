import { useMemo } from 'react'
import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { useStore } from '@/dao/store/useStore'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { SpinnerComponent as Spinner } from '../../Spinner'
import { FeesBarChart } from './FeesBarChart'

export const VeCrvFeesChart = () => {
  const veCrvFees = useStore((state) => state.analytics.veCrvFees)
  const getVeCrvFees = useStore((state) => state.analytics.getVeCrvFees)

  const feesLoading = veCrvFees.fetchStatus === 'LOADING'
  const feesError = veCrvFees.fetchStatus === 'ERROR'
  const feesReady = veCrvFees.fetchStatus === 'SUCCESS'

  const reverseOrderFees = useMemo(() => {
    if (!feesReady || veCrvFees.fees.length === 0) return []

    return [...veCrvFees.fees].reverse().slice(-52)
  }, [feesReady, veCrvFees.fees])

  return (
    <Wrapper>
      <TitleRow>
        <BoxTitle>{t`veCRV Fees Last 52 Weeks`}</BoxTitle>
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
