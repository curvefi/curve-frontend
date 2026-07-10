import type { ChartAndActivityTab } from '@/llamalend/widgets/ChartAndActivityLayout'
import { t } from '@ui-kit/lib/i18n'
import type { MarketSectionOption } from './types'

export const getBorrowMarketSections = (
  setChartAndActivityTab: (tab: ChartAndActivityTab) => void,
): MarketSectionOption[] => [
  { value: 'position-details', label: t`Position Details` },
  { value: 'price-chart', label: t`Price Chart`, onSelect: () => setChartAndActivityTab('chart') },
  { value: 'market-activity', label: t`Market Activity`, onSelect: () => setChartAndActivityTab('events') },
  { value: 'historical-rates', label: t`Historical Rates` },
  { value: 'advanced-details', label: t`Advanced Details` },
  { value: 'faqs', label: t`FAQs` },
]
