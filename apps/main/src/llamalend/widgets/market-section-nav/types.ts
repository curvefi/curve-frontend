export type MarketSectionId =
  | 'position-details'
  | 'market-overview'
  | 'price-chart'
  | 'market-activity'
  | 'historical-rates'
  | 'market-parameters'
  | 'faqs'

export type MarketSectionOption = {
  value: MarketSectionId
  label: string
  mobileLabel?: string
}
