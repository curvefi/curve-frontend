import type { Params } from 'react-router'

import { t } from '@lingui/macro'
import useStore from '@/store/useStore'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'

import { HealthColorText, MainUserInfoStats, MainUserInfoStatsContent } from '@/components/DetailsUser/styles'
import Box from '@/ui/Box'
import CellRate from '@/components/SharedCellData/CellRate'
import DetailInfo from '@/ui/DetailInfo'
import InpChipUsdRate from '@/components/InpChipUsdRate'

const DetailsUserLoanStatsMobile = ({
  rChainId,
  rOwmId,
  borrowed_token,
  collateral_token,
  liqPriceRange,
  parsedHealthModePercent,
  userActiveKey,
}: PageContentProps & {
  liqPriceRange: { price1: string; price2: string; band1: number; band2: number } | undefined
  params: Params
  parsedHealthModePercent: string | undefined
  showManageLink: boolean
}) => {
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const userLoanDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  // TODO: handle error
  const { details: userLoanDetails } = userLoanDetailsResp ?? {}

  return (
    <Box>
      <Box grid gridRowGap={1} flexAlignItems="flex-start" margin="0 0 var(--spacing-normal) 0">
        <MainUserInfoStats title={t`Debt (${borrowed_token?.symbol})`}>
          <MainUserInfoStatsContent>{formatNumber(userLoanDetails?.state?.debt)}</MainUserInfoStatsContent>
          <br />
          <InpChipUsdRate isBold hideRate address={borrowed_token?.address} amount={userLoanDetails?.state?.debt} />
        </MainUserInfoStats>
      </Box>

      <DetailInfo label={t`Status`}>
        {userLoanDetails?.status && (
          <HealthColorText as="strong" colorKey={userLoanDetails?.status?.colorKey}>
            {userLoanDetails?.status?.label}
          </HealthColorText>
        )}
      </DetailInfo>
      <DetailInfo label={t`Health`}>
        {parsedHealthModePercent && userLoanDetails?.status && (
          <HealthColorText as="strong" colorKey={userLoanDetails?.status?.colorKey}>
            {formatNumber(parsedHealthModePercent, FORMAT_OPTIONS.PERCENT)}
          </HealthColorText>
        )}
      </DetailInfo>
      <DetailInfo label={t`Borrow rate`}>
        <CellRate isBold type="borrow" rChainId={rChainId} rOwmId={rOwmId} />
      </DetailInfo>

      {isAdvanceMode && (
        <DetailInfo label={t`Loan balances`}>
          <strong>
            {formatNumber(userLoanDetails?.state?.collateral, { defaultValue: '-' })}
            {collateral_token?.symbol ?? ''}, {formatNumber(userLoanDetails?.state?.borrowed, { defaultValue: '-' })}
            {borrowed_token?.symbol ?? ''}
          </strong>
        </DetailInfo>
      )}

      <DetailInfo label={t`Liquidation range`}>
        {liqPriceRange && <strong>{`${liqPriceRange.price1} to ${liqPriceRange.price2}`}</strong>}
      </DetailInfo>
      {isAdvanceMode && (
        <>
          <DetailInfo label={t`Band range`}>
            {liqPriceRange && <strong>{`${liqPriceRange.band1} to ${liqPriceRange.band2}`}</strong>}
          </DetailInfo>
          <DetailInfo label={t`Range %`}>
            {userLoanDetails?.bandsPct && (
              <strong>{formatNumber(userLoanDetails.bandsPct, FORMAT_OPTIONS.PERCENT)}</strong>
            )}
          </DetailInfo>
        </>
      )}
    </Box>
  )
}

export default DetailsUserLoanStatsMobile
