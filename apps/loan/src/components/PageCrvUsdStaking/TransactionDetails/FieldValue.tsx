import styled from 'styled-components'

import { formatNumber, FORMAT_OPTIONS } from '@/ui/utils'
import { isReady, isLoading, isIdle } from '@/components/PageCrvUsdStaking/utils'

import Loader from '@/ui/Loader'
import Tooltip from '@/ui/Tooltip'
import Icon from '@/ui/Icon'

type FieldValueProps = {
  value: string | number
  fetchStatus: FetchStatus
  gas?: {
    estGasCostUsd: string | number
    estGasCost: string | number
    tooltip: string
  }
}

const FieldValue: React.FC<FieldValueProps> = ({ value, fetchStatus, gas = null }) => {
  if (gas) {
    return (
      <TransactionFieldValue>
        <Tooltip tooltip={gas.tooltip} noWrap>
          <Icon name="Fire" size={16} />
          {isReady(fetchStatus) && formatNumber(gas.estGasCostUsd, FORMAT_OPTIONS.USD)}
          {isLoading(fetchStatus) && <Loader skeleton={[36, 12]} />}
          {isIdle(fetchStatus) && '-'}
        </Tooltip>
      </TransactionFieldValue>
    )
  }

  if (status === 'loading') {
    return (
      <TransactionFieldValue>
        <Loader skeleton={[36, 12]} />
      </TransactionFieldValue>
    )
  }

  if (status === '') {
    return <TransactionFieldValue>-</TransactionFieldValue>
  }

  return <TransactionFieldValue>{value}</TransactionFieldValue>
}

const TransactionFieldValue = styled.div`
  font-size: var(--font-size-2);
  display: flex;
  flex-direction: row;
  align-items: center;
`

export default FieldValue
