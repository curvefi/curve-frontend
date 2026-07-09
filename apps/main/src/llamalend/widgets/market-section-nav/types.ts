import type { RefObject } from 'react'

export type MarketSectionId =
  | 'position-details'
  | 'price-chart'
  | 'market-activity'
  | 'historical-rates'
  | 'advanced-details'
  | 'faqs'

export type MarketSectionRef = RefObject<HTMLElement | null>

export type MarketSectionOption = {
  value: MarketSectionId
  label: string
  ref: MarketSectionRef
  onClick?: () => void
}
