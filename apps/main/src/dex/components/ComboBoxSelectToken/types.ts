import { Token } from '@main/types/main.types'

export type EndsWith = (string: string, substring: string) => boolean

export type ComboBoxSelectTokenProps = {
  disabled?: boolean
  imageBaseUrl: string
  listBoxHeight?: string
  selectedToken: Token | undefined
  showBalances?: boolean
  showCheckboxHideSmallPools?: boolean
  showInpSearch?: boolean
  testId?: string
  title: string
  tokens: Token[] | undefined
  onSelectionChange(selectedAddress: string): void
}
