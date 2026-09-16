import { useMemo, useState } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import { getMarketRateTypeTabConfig } from '@/llamalend/rates.utils'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { usePageHeaderRates } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { type TimeOption, timeOptions } from '@evm-ui/lib/model/query/time-option-validation'
import { SelectTimeOption } from '@evm-ui/shared/ui/Chart'
import { MarketRateType } from '@evm-ui/types/market'
import { MAINNET_CRV_ADDRESS } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { Chain } from '@primitives/network.utils'
import { notFalsy, notFalsyArray } from '@primitives/objects.utils'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { mapQuery, q } from '@ui/features/queries/util'
import { useTabs } from '@ui/hooks/useTabs'
import { t } from '@ui/lib/i18n'
import { stackedCardHeadersSx } from '@ui/lib/mui'
import { buildBorrowRateBreakdown, buildSupplyRateBreakdown } from './market-rate-breakdown.utils'
import { PointsCampaignsCard, RateBreakdownTable } from './MarketRateBreakdownCards'

type HistoricalRatesTabProps = { timeOption: TimeOption }

const MarketBorrowHistoricalRates = ({ timeOption }: HistoricalRatesTabProps) => {
  const {
    chainId,
    blockchainId,
    tokens: { collateralToken },
  } = useMarketContext()
  const { borrowRate } = usePageHeaderRates()
  const collateralPrice = q(
    useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address }, borrowRate.data?.rebasingYield != null),
  )
  const borrowQuery = mapQuery(borrowRate, rate =>
    buildBorrowRateBreakdown({ rate, chainId, blockchainId, collateralToken, collateralPrice }),
  )

  return (
    <Stack sx={stackedCardHeadersSx}>
      <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} timeOption={timeOption} />
      <RateBreakdownTable rateType={MarketRateType.Borrow} query={borrowQuery} />
      {!!borrowQuery.data?.points.length && (
        <PointsCampaignsCard rateType={MarketRateType.Borrow} rows={borrowQuery.data.points} />
      )}
    </Stack>
  )
}

const MarketSupplyHistoricalRates = ({ timeOption }: HistoricalRatesTabProps) => {
  const {
    chainId,
    blockchainId,
    tokens: { borrowToken },
  } = useMarketContext()
  const { supplyRate } = usePageHeaderRates()
  const addresses = useMemo(
    () =>
      notFalsy(
        supplyRate?.data?.rebasingYield != null && borrowToken?.address,
        ...notFalsyArray(
          supplyRate?.data?.extraIncentives.map(
            ({ address }) => address.toLowerCase() !== MAINNET_CRV_ADDRESS && address,
          ),
        ),
      ),
    [borrowToken?.address, supplyRate?.data],
  )
  const prices = useTokenUsdRates({ chainId, tokenAddresses: addresses })
  const crvPrice = q(
    useTokenUsdRate(
      { chainId: Chain.Ethereum, tokenAddress: MAINNET_CRV_ADDRESS },
      !!(supplyRate?.data?.supplyApyCrvMinBoost || supplyRate?.data?.supplyApyCrvMaxBoost),
    ),
  )
  if (!supplyRate) return null

  const supplyQuery = mapQuery(supplyRate, rate =>
    buildSupplyRateBreakdown({ rate, chainId, blockchainId, borrowToken, prices, crvPrice }),
  )

  return (
    <Stack sx={stackedCardHeadersSx}>
      <MarketHistoricalRatesChart rateMode={MarketRateType.Supply} timeOption={timeOption} />
      <RateBreakdownTable rateType={MarketRateType.Supply} query={supplyQuery} />
      {!!supplyQuery.data?.points.length && (
        <PointsCampaignsCard rateType={MarketRateType.Supply} rows={supplyQuery.data.points} />
      )}
    </Stack>
  )
}

const HISTORICAL_RATE_TABS = {
  [MarketRateType.Borrow]: { label: t`Borrow rate`, component: MarketBorrowHistoricalRates },
  [MarketRateType.Supply]: { label: t`Supply rate`, component: MarketSupplyHistoricalRates },
}

export const MarketHistoricalRatesTabs = ({ rateType }: { rateType: MarketRateType }) => {
  const { marketType, controllerAddress } = useMarketContext()
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const { types, defaultValue } = getMarketRateTypeTabConfig({ marketType, rateType })
  const { tab, tabs, onChange, content } = useTabs({
    menu: types.map(type => ({ ...HISTORICAL_RATE_TABS[type], value: type })),
    params: { timeOption },
    defaultValue,
  })

  return (
    <Stack>
      <Stack direction="row" sx={{ alignItems: 'end', justifyContent: 'space-between' }}>
        <TabsSwitcher
          variant="contained"
          value={tab.value}
          onChange={onChange}
          options={tabs}
          testIdPrefix="historical-rate-tab"
        />
        <SelectTimeOption<TimeOption>
          options={timeOptions}
          activeOption={timeOption}
          setActiveOption={setTimeOption}
          isLoading={!controllerAddress}
        />
      </Stack>
      {content}
    </Stack>
  )
}
