import type { DetailPageSectionOption } from '@evm-ui/widgets/DetailPageLayout/DetailPageSectionNav'

export type MarketSectionId =
  | 'position-details'
  | 'market-overview'
  | 'price-chart'
  | 'market-activity'
  | 'historical-rates'
  | 'market-parameters'
  | 'faqs'

export type MarketSectionOption = DetailPageSectionOption<MarketSectionId>
