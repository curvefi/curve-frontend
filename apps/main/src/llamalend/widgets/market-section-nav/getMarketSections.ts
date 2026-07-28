import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import type { MarketSectionOption } from './types'

const RATES_SECTION = { value: 'historical-rates', label: { default: t`Rates` } } as const
const PARAMETERS_SECTION = {
  value: 'market-parameters',
  label: { default: t`Advanced details`, short: t`Advanced` },
} as const
const FAQ_SECTION = { value: 'faqs', label: { default: t`FAQs` } } as const
const OVERVIEW_SECTION = { value: 'market-overview', label: { default: t`Overview` } } as const

export const getMarketSections = ({
  rateType,
  hasPosition = true,
}: {
  rateType: MarketRateType
  hasPosition?: boolean
}): readonly MarketSectionOption[] => {
  const leadingSections = notFalsy<MarketSectionOption>(
    hasPosition && {
      value: 'position-details',
      label: { default: t`Position details`, short: t`Position` },
    },
  )

  const sections = {
    [MarketRateType.Supply]: [...leadingSections, OVERVIEW_SECTION, RATES_SECTION, PARAMETERS_SECTION, FAQ_SECTION],
    [MarketRateType.Borrow]: [
      ...leadingSections,
      OVERVIEW_SECTION,
      { value: 'price-chart', label: { default: t`Risk & Liquidation`, short: t`Risk` } },
      RATES_SECTION,
      { value: 'market-activity', label: { default: t`Market activity`, short: t`Activity` } },
      PARAMETERS_SECTION,
      FAQ_SECTION,
    ],
  } satisfies Record<MarketRateType, readonly MarketSectionOption[]>

  return sections[rateType]
}
