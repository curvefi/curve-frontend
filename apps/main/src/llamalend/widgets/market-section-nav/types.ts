export type MarketSectionId =
  | 'position-details'
  | 'price-chart'
  | 'market-activity'
  | 'historical-rates'
  | 'advanced-details'
  | 'faqs'

export type MarketSectionOption = {
  value: MarketSectionId
  label: string
  onSelect?: () => void
}
