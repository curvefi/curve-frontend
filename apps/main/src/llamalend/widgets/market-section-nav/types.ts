import type { DetailPageSectionOption } from '@ui/features/layout/DetailPageLayout/DetailPageSectionNav'

export type MarketSectionId =
  'position-details' | 'price-chart' | 'market-activity' | 'historical-rates' | 'market-parameters' | 'faqs'

export type MarketSectionOption = DetailPageSectionOption<MarketSectionId>
