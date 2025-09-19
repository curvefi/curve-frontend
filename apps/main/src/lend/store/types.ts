export type LiqRange = {
  n: number
  collateral: string
  debt: string
  maxRecv: string | null
  maxRecvError: string
  prices: string[]
  bands: [number, number]
}

export type LiqRangeSliderIdx = LiqRange & { sliderIdx: number }
export type LiqRangesMapper = { [n: string]: LiqRangeSliderIdx }
