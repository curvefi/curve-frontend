import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import useEstimateGasConversion from '@/hooks/useEstimateGasConversion'
import { formatNumber, FORMAT_OPTIONS } from '@/ui/utils'
import { isReady } from '@/components/PageCrvUsdStaking/utils'

import Icon from '@/ui/Icon'
import Box from '@/ui/Box'
import Tooltip from '@/ui/Tooltip'

import DetailInfoSlippageTolerance from '@/components/DetailInfoSlippageTolerance'

type TransactionDetailsProps = {
  className?: string
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const maxSlippage = useStore((state) => state.maxSlippage)
  const estimateGasDepositApprove = useStore((state) => state.scrvusd.estimateGas.depositApprove)
  const { gas, fetchStatus } = useStore((state) => state.scrvusd.estGas)
  const { lendApi, curve, curve: chainId } = useStore((state) => state)

  const { estGasCost, estGasCostUsd, tooltip } = useEstimateGasConversion(gas)

  useEffect(() => {
    if (lendApi && curve) {
      estimateGasDepositApprove(1000)
    }
  }, [lendApi, estimateGasDepositApprove, chainId, curve])

  return (
    <TransactionDetailsWrapper className={className}>
      <ToggleField isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <ToggleTitle>{t`1 crvUSD = 0.82 scrvUSD`}</ToggleTitle>
        <Box flex>
          {!isOpen && (
            <ToggleValue>
              <Tooltip tooltip={tooltip} noWrap>
                <Icon name="Fire" size={16} />
                {isReady(fetchStatus) ? formatNumber(estGasCostUsd, FORMAT_OPTIONS.USD) : '-'}
              </Tooltip>
            </ToggleValue>
          )}
          <StyledIcon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Box>
      </ToggleField>
      {isOpen && (
        <>
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
            <TransactionFieldValue>
              <Tooltip tooltip={tooltip} noWrap>
                <Icon name="Fire" size={16} />
                {isReady(fetchStatus) ? formatNumber(estGasCostUsd, FORMAT_OPTIONS.USD) : '-'}
              </Tooltip>
            </TransactionFieldValue>
          </TransactionField>
          <TransactionField>
            <TransactionFieldLabel>{t`Additional slippage tolerance`}</TransactionFieldLabel>
            <TransactionFieldValue>
              <StyledDetailInfoSlippageTolerance noLabel maxSlippage={maxSlippage} />
            </TransactionFieldValue>
          </TransactionField>
        </>
      )}
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
  padding-bottom: var(--spacing-1);
`

const TransactionFieldLabel = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  opacity: 0.5;
`

const TransactionFieldValue = styled.div`
  font-size: var(--font-size-2);
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ToggleField = styled(TransactionField)<{ isOpen: boolean }>`
  cursor: pointer;
  ${({ isOpen }) => isOpen && 'border-bottom: 1px solid var(--gray-500a25)'};
  ${({ isOpen }) => isOpen && 'padding-bottom: var(--spacing-2)'};
  ${({ isOpen }) => isOpen && 'margin-bottom: var(--spacing-2)'};
`

const ToggleTitle = styled.div`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
`

const ToggleValue = styled.div`
  font-size: var(--font-size-2);
  display: flex;
  flex-direction: row;
  align-items: center;
`

const StyledIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

const StyledDetailInfoSlippageTolerance = styled(DetailInfoSlippageTolerance)``

export default TransactionDetails
