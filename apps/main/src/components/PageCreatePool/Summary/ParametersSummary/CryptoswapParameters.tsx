import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import { isTricrypto } from '@/components/PageCreatePool/utils'

import networks from '@/networks'

import {
  CategoryDataRow,
  ExtraMarginRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
} from '@/components/PageCreatePool/Summary/styles'

type Props = {
  chainId: ChainId
}

const StableswapParameters = ({ chainId }: Props) => {
  const { tokensInPool, initialPrice, advanced } = useStore((state) => state.createPool)
  const { midFee, outFee, maHalfTime, gamma, feeGamma, allowedExtraProfit, cryptoA, adjustmentStep } = useStore(
    (state) => state.createPool.parameters
  )

  return (
    <>
      <ExtraMarginRow>
        <SummaryDataTitle>{t`Mid Fee:`}</SummaryDataTitle>
        {midFee === '' ? (
          <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{`${midFee.toString()}%`}</SummaryData>
        )}
      </ExtraMarginRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Out Fee:`}</SummaryDataTitle>
        {outFee === '' ? (
          <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{`${outFee.toString()}%`}</SummaryData>
        )}
      </CategoryDataRow>
      <ExtraMarginRow>
        <SummaryDataTitle>{t`Initial Price${
          isTricrypto(
            networks[chainId].tricryptoFactory,
            tokensInPool.tokenAmount,
            tokensInPool.tokenA,
            tokensInPool.tokenB,
            tokensInPool.tokenC
          )
            ? ' A'
            : ''
        }:`}</SummaryDataTitle>
        {initialPrice.initialPrice[0] === '0' ? (
          <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{initialPrice.initialPrice[0]}</SummaryData>
        )}
      </ExtraMarginRow>
      {isTricrypto(
        networks[chainId].tricryptoFactory,
        tokensInPool.tokenAmount,
        tokensInPool.tokenA,
        tokensInPool.tokenB,
        tokensInPool.tokenC
      ) && (
        <CategoryDataRow>
          <SummaryDataTitle>{t`Initial Price B:`}</SummaryDataTitle>
          {initialPrice.initialPrice[1] === '0' ? (
            <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
          ) : (
            <SummaryData>{initialPrice.initialPrice[1]}</SummaryData>
          )}
        </CategoryDataRow>
      )}
      {/* Advanced */}
      {advanced && (
        <>
          <ExtraMarginRow>
            <SummaryDataTitle>{t`A:`}</SummaryDataTitle>
            {cryptoA === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${cryptoA.toString()}`}</SummaryData>
            )}
          </ExtraMarginRow>
          <CategoryDataRow>
            <SummaryDataTitle>Gamma:</SummaryDataTitle>
            {gamma === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${gamma.toString()}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Allowed Extra Profit:`}</SummaryDataTitle>
            {allowedExtraProfit === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${allowedExtraProfit.toString()}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Fee Gamma:`}</SummaryDataTitle>
            {feeGamma === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${feeGamma.toString()}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Adjustment Step:`}</SummaryDataTitle>
            {adjustmentStep === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${adjustmentStep.toString()}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Moving Average Time:`}</SummaryDataTitle>
            {maHalfTime === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${maHalfTime.toString()}`}s</SummaryData>
            )}
          </CategoryDataRow>
        </>
      )}
    </>
  )
}

export default StableswapParameters
