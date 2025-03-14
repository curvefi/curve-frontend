import { GaugeFormattedData } from '@/dao/types/dao.types'

export type EndsWith = (string: string, substring: string) => boolean

export type ComboBoxSelectGaugeProps = {
  disabled?: boolean
  listBoxHeight?: string
  selectedGauge: GaugeFormattedData | undefined
  showInpSearch?: boolean
  testId?: string
  title: string
  gauges: GaugeFormattedData[] | undefined
  onSelectionChange(selectedGaugeAddress: string): void
}
