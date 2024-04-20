import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import networks from '@/networks'

import { IMPLEMENTATION_IDS } from '@/components/PageCreatePool/constants'

import {
  CategoryDataRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
  ExtraMarginRow,
} from '@/components/PageCreatePool/Summary/styles'

type Props = {
  chainId: ChainId
}

const StableswapParameters = ({ chainId }: Props) => {
  const {
    parameters: { stableSwapFee, stableA, maExpTime, offpegFeeMultiplier },
    advanced,
    implementation,
  } = useStore((state) => state.createPool)

  const implementations = IMPLEMENTATION_IDS(chainId)

  return (
    <>
      <ExtraMarginRow>
        <SummaryDataTitle>{t`Swap Fee:`}</SummaryDataTitle>
        {stableSwapFee === '' ? (
          <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
        ) : (
          <SummaryData>{stableSwapFee}%</SummaryData>
        )}
      </ExtraMarginRow>
      {/* Advanced */}
      {advanced && (
        <>
          <ExtraMarginRow>
            <SummaryDataTitle>A:</SummaryDataTitle>
            {stableA === '' ? <SummaryDataPlaceholder>-</SummaryDataPlaceholder> : <SummaryData>{stableA}</SummaryData>}
          </ExtraMarginRow>
          {networks[chainId].stableswapFactory && (
            <>
              <CategoryDataRow>
                <SummaryDataTitle>{t`Offpeg Fee Multiplier:`}</SummaryDataTitle>
                {offpegFeeMultiplier === '' ? (
                  <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
                ) : (
                  <SummaryData>{offpegFeeMultiplier}</SummaryData>
                )}
              </CategoryDataRow>
              <CategoryDataRow>
                <SummaryDataTitle>{t`Moving Average Time:`}</SummaryDataTitle>
                {maExpTime === '' ? (
                  <SummaryDataPlaceholder>-</SummaryDataPlaceholder>
                ) : (
                  <SummaryData>{maExpTime}s</SummaryData>
                )}
              </CategoryDataRow>
            </>
          )}
          {!networks[chainId].stableswapFactory && advanced && (
            <CategoryDataRow>
              <SummaryDataTitle>{t`Pool Implementation:`}</SummaryDataTitle>
              <SummaryData>{implementations[implementation].name}</SummaryData>
            </CategoryDataRow>
          )}
        </>
      )}
    </>
  )
}

export default StableswapParameters
