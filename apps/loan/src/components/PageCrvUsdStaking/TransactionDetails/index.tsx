import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'

type TransactionDetailsProps = {
  className?: string
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ className }) => {
  const maxSlippage = useStore((state) => state.maxSlippage)

  return (
    <TransactionDetailsWrapper className={className}>
      <TransactionField>
        <TransactionFieldLabel>{t`You recieve`}</TransactionFieldLabel>
        <TransactionFieldValue>{t`Exchange rate`}</TransactionFieldValue>
      </TransactionField>
      <TransactionField>
        <TransactionFieldLabel>{t`Your scrvUSD share`}</TransactionFieldLabel>
        <TransactionFieldValue>{t`Exchange rate`}</TransactionFieldValue>
      </TransactionField>
      <TransactionField>
        <TransactionFieldLabel>{t`Estimated tx cost`}</TransactionFieldLabel>
        <TransactionFieldValue>{t`Exchange rate`}</TransactionFieldValue>
      </TransactionField>
      <TransactionField>
        <TransactionFieldLabel>{t`Additional slippage tolerance`}</TransactionFieldLabel>
        <TransactionFieldValue>
          <StyledDetailInfoSlippageTolerance noLabel maxSlippage={maxSlippage} />
        </TransactionFieldValue>
      </TransactionField>
    </TransactionDetailsWrapper>
  )
}

const TransactionDetailsWrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TransactionField = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const TransactionFieldLabel = styled.div`
  font-size: var(--font-size-2);
  opacity: 0.5;
`

const TransactionFieldValue = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const StyledDetailInfoSlippageTolerance = styled(DetailInfoSlippageTolerance)``

export default TransactionDetails
