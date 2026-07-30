export type MarketSectionId =
  | 'position-details'
  | 'market-overview'
  | 'price-chart'
  | 'market-activity'
  | 'historical-rates'
  | 'market-parameters'
  | 'faqs'

type MarketSectionLabel = {
  default: string
  /** Shortened version of the label used on mobile. */
  short?: string
}

export type MarketSectionOption = {
  value: MarketSectionId
  label: MarketSectionLabel
}
