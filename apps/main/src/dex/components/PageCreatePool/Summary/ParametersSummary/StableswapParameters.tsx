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
  const advanced = useStore((state) => state.createPool.advanced)
  const stableSwapFee = useStore((state) => state.createPool.parameters.stableSwapFee)
  const stableA = useStore((state) => state.createPool.parameters.stableA)
  const maExpTime = useStore((state) => state.createPool.parameters.maExpTime)
  const offpegFeeMultiplier = useStore((state) => state.createPool.parameters.offpegFeeMultiplier)
  const stableswapFactory = useStore((state) => state.networks.networks[chainId].stableswapFactory)

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
