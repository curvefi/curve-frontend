import {
  CategoryDataRow,
  ExtraMarginRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
} from '@/dex/components/PageCreatePool/Summary/styles'
import { isTricrypto } from '@/dex/components/PageCreatePool/utils'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useStore } from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  chainId: ChainId
}

export const StableswapParameters = ({ chainId }: Props) => {
  const tokensInPool = useStore((state) => state.createPool.tokensInPool)
  const initialPrice = useStore((state) => state.createPool.initialPrice)
  const advanced = useStore((state) => state.createPool.advanced)
  const midFee = useStore((state) => state.createPool.parameters.midFee)
  const outFee = useStore((state) => state.createPool.parameters.outFee)
  const maHalfTime = useStore((state) => state.createPool.parameters.maHalfTime)
  const gamma = useStore((state) => state.createPool.parameters.gamma)
  const feeGamma = useStore((state) => state.createPool.parameters.feeGamma)
  const allowedExtraProfit = useStore((state) => state.createPool.parameters.allowedExtraProfit)
  const cryptoA = useStore((state) => state.createPool.parameters.cryptoA)
  const adjustmentStep = useStore((state) => state.createPool.parameters.adjustmentStep)
  const { data: network } = useNetworkByChain({ chainId })

  return (
    <>
      <ExtraMarginRow>
        <SummaryDataTitle>{t`Mid Fee:`}</SummaryDataTitle>
        {midFee === '' ? <SummaryDataPlaceholder>-</SummaryDataPlaceholder> : <SummaryData>{`${midFee}%`}</SummaryData>}
      </ExtraMarginRow>
      <CategoryDataRow>
        <SummaryDataTitle>{t`Out Fee:`}</SummaryDataTitle>
        {outFee === '' ? <SummaryDataPlaceholder>-</SummaryDataPlaceholder> : <SummaryData>{`${outFee}%`}</SummaryData>}
      </CategoryDataRow>
      <ExtraMarginRow>
        <SummaryDataTitle>{t`Initial Price${
          isTricrypto(
            network.tricryptoFactory,
            tokensInPool.tokenAmount,
            tokensInPool.tokenA,
            tokensInPool.tokenB,
            tokensInPool.tokenC,
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
        network.tricryptoFactory,
        tokensInPool.tokenAmount,
        tokensInPool.tokenA,
        tokensInPool.tokenB,
        tokensInPool.tokenC,
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
              <SummaryData>{`${cryptoA}`}</SummaryData>
            )}
          </ExtraMarginRow>
          <CategoryDataRow>
            <SummaryDataTitle>Gamma:</SummaryDataTitle>
            {gamma === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${gamma}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Allowed Extra Profit:`}</SummaryDataTitle>
            {allowedExtraProfit === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${allowedExtraProfit}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Fee Gamma:`}</SummaryDataTitle>
            {feeGamma === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${feeGamma}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Adjustment Step:`}</SummaryDataTitle>
            {adjustmentStep === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${adjustmentStep}`}</SummaryData>
            )}
          </CategoryDataRow>
          <CategoryDataRow>
            <SummaryDataTitle>{t`Moving Average Time:`}</SummaryDataTitle>
            {maHalfTime === '' ? (
              <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
            ) : (
              <SummaryData>{`${maHalfTime}`}s</SummaryData>
            )}
          </CategoryDataRow>
        </>
      )}
    </>
  )
}
