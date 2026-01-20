import { useEffect } from 'react'
import { styled } from 'styled-components'
import { ErrorMessage } from '@/dao/components/ErrorMessage'
import { useStore } from '@/dao/store/useStore'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'
import { SpinnerComponent as Spinner } from '../../Spinner'
import { PositiveAndNegativeBarChart } from './PositiveAndNegativeBarChart'

export const DailyLocks = () => {
  const getVeCrvLocks = useStore((state) => state.analytics.getVeCrvLocks)
  const veCrvLocks = useStore((state) => state.analytics.veCrvLocks)

  const locksFetchSuccess = veCrvLocks.fetchStatus === 'SUCCESS'
  const locksFetchError = veCrvLocks.fetchStatus === 'ERROR'
  const locksFetchLoading = veCrvLocks.fetchStatus === 'LOADING'

  useEffect(() => {
    if (veCrvLocks.locks.length === 0 && veCrvLocks.fetchStatus !== 'ERROR') {
      void getVeCrvLocks()
    }
  }, [getVeCrvLocks, veCrvLocks.locks.length, veCrvLocks.fetchStatus])

  return (
    <Wrapper>
      <BoxTitle>{t`Daily veCRV Locks Last 100 Days`}</BoxTitle>
      <Content>
        {locksFetchLoading && <Spinner height="32.5rem" />}
        {locksFetchError && <ErrorMessage message={t`Error fetching daily veCRV locks`} onClick={getVeCrvLocks} />}
        {locksFetchSuccess && <PositiveAndNegativeBarChart height={520} data={veCrvLocks.locks.slice(256, 356)} />}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  width: 100%;
  margin-bottom: auto;
`

const BoxTitle = styled.h4`
  font-size: var(--font-size-3);
  font-weight: bold;
  padding: var(--spacing-3);
`

const Content = styled.div`
  padding: 0 var(--spacing-3) var(--spacing-3);
`
