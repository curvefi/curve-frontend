import { t } from '@lingui/macro'
import useStore from '@main/store/useStore'
import { IMPLEMENTATION_IDS } from '@main/components/PageCreatePool/constants'
import {
  CategoryDataRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
  ExtraMarginRow,
} from '@main/components/PageCreatePool/Summary/styles'
import { ChainId } from '@main/types/main.types'

type Props = {
  chainId: ChainId
}

const StableswapParameters = ({ chainId }: Props) => {
  const {
    parameters: { stableSwapFee, stableA, maExpTime, offpegFeeMultiplier },
    advanced,
    implementation,
  } = useStore((state) => state.createPool)
  const nativeToken = useStore((state) => state.networks.nativeToken[chainId])
  const { stableswapFactory } = useStore((state) => state.networks.networks[chainId])

  const implementations = IMPLEMENTATION_IDS(nativeToken)

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
          {stableswapFactory && (
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
          {!stableswapFactory && advanced && (
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
