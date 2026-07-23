import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import type { MarketSectionOption } from './types'

const POSITION_SECTION = {
  value: 'position-details',
  label: t`Position details`,
  mobileLabel: t`Position`,
} as const
const OVERVIEW_SECTION = { value: 'market-overview', label: t`Overview` } as const
const RATES_SECTION = { value: 'historical-rates', label: t`Rates` } as const
const PARAMETERS_SECTION = {
  value: 'market-parameters',
  label: t`Advanced details`,
  mobileLabel: t`Advanced`,
} as const
const FAQ_SECTION = { value: 'faqs', label: t`FAQs` } as const

export const getMarketSections = ({
  rateType,
  hasPosition = true,
  showOverview = true,
}: {
  rateType: MarketRateType
  hasPosition?: boolean
  showOverview?: boolean
}): readonly MarketSectionOption[] => {
  const leadingSections = [...(hasPosition ? [POSITION_SECTION] : []), ...(showOverview ? [OVERVIEW_SECTION] : [])]

  return rateType === MarketRateType.Supply
    ? [...leadingSections, RATES_SECTION, PARAMETERS_SECTION, FAQ_SECTION]
    : [
        ...leadingSections,
        { value: 'price-chart', label: t`Risk & Liquidation`, mobileLabel: t`Risk` },
        RATES_SECTION,
        { value: 'market-activity', label: t`Market activity`, mobileLabel: t`Activity` },
        PARAMETERS_SECTION,
        FAQ_SECTION,
      ]
}
