import styled from 'styled-components'
import { useState } from 'react'
import { t } from '@lingui/macro'

import useStore from '@/loan/store/useStore'
import useEstimateGasConversion from '@/loan/hooks/useEstimateGasConversion'
import { formatNumber } from '@ui/utils'
import { isLoading, isReady } from '@/loan/components/PageCrvUsdStaking/utils'

import Icon from '@ui/Icon'
import Box from '@ui/Box'
import Loader from '@ui/Loader'

import Switch from '@/loan/components/PageCrvUsdStaking/components/Switch'
import DetailInfoSlippageTolerance from '@/loan/components/DetailInfoSlippageTolerance'
import FieldValue from '@/loan/components/PageCrvUsdStaking/TransactionDetails/FieldValue'
import { useWallet } from '@ui-kit/features/connect-wallet'

type TransactionDetailsProps = {
  className?: string
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { signerAddress } = useWallet()
  const { preview, crvUsdExchangeRate, approveInfinite, setApproveInfinite, stakingModule } = useStore(
    (state) => state.scrvusd,
  )
  const fetchStatus = useStore((state) => state.scrvusd.estGas.fetchStatus)
  const estimateGas = useStore((state) => state.scrvusd.getEstimateGas(signerAddress ?? ''))

  const { estGasCost, estGasCostUsd, tooltip } = useEstimateGasConversion(estimateGas)
  const exchangeRateLoading = isLoading(crvUsdExchangeRate.fetchStatus)

  return (
    <TransactionDetailsWrapper className={className}>
      <ToggleField isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <ToggleTitle>
          {exchangeRateLoading ? (
            <Loader isLightBg skeleton={[72, 12]} />
          ) : (
            t`1 crvUSD = ${formatNumber(crvUsdExchangeRate.value, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          scrvUSD`
          )}
        </ToggleTitle>
        <Box flex>
          {!isOpen && (
            <FieldValue value={estGasCostUsd} fetchStatus={fetchStatus} gas={{ estGasCostUsd, estGasCost, tooltip }} />
          )}
          <StyledIcon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={16} />
        </Box>
      </ToggleField>
      {isOpen && (
        <>
          <TransactionField>
            <TransactionFieldLabel>{t`You receive`}</TransactionFieldLabel>
            <FieldValue
              value={preview.value}
              fetchStatus={preview.fetchStatus}
              symbol={isReady(preview.fetchStatus) ? (stakingModule === 'deposit' ? t`scrvUSD` : t`crvUSD`) : null}
            />
          </TransactionField>
          {/* <TransactionField>
            <TransactionFieldLabel>{t`Your scrvUSD share`}</TransactionFieldLabel>
            <FieldValue value={preview.value} fetchStatus={preview.fetchStatus} />
          </TransactionField> */}
          <TransactionField>
            <TransactionFieldLabel>{t`Infinite allowance`}</TransactionFieldLabel>
            <Switch isActive={approveInfinite} onChange={setApproveInfinite} />
          </TransactionField>
          <TransactionField>
            <TransactionFieldLabel>{t`Estimated TX cost`}</TransactionFieldLabel>
            <FieldValue value={estGasCostUsd} fetchStatus={fetchStatus} gas={{ estGasCostUsd, estGasCost, tooltip }} />
          </TransactionField>
          {/* <TransactionField>
            <TransactionFieldLabel>{t`Additional slippage tolerance`}</TransactionFieldLabel>
            <TransactionFieldValue>
              <StyledDetailInfoSlippageTolerance noLabel maxSlippage={maxSlippage} />
            </TransactionFieldValue>
          </TransactionField> */}
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
