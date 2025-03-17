import {
  CategoryDataRow,
  SummaryDataTitle,
  SummaryData,
  SummaryDataPlaceholder,
  ExtraMarginRow,
} from '@/dex/components/PageCreatePool/Summary/styles'
import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  chainId: ChainId
}

const StableswapParameters = ({ chainId }: Props) => {
  const {
    parameters: { stableSwapFee, stableA, maExpTime, offpegFeeMultiplier },
    advanced,
  } = useStore((state) => state.createPool)
  const { stableswapFactory } = useStore((state) => state.networks.networks[chainId])

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
        </>
      )}
    </>
  )
}

export default StableswapParameters
