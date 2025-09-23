import { Address } from '@ui-kit/utils'

export type TokenOption = {
  address: Address
  symbol: string
  chain?: string
  label?: string
  volume?: number
}

export function tokenOptionEquals(a?: TokenOption, b?: TokenOption) {
  return a?.address == b?.address && a?.chain == b?.chain
}

// todo: the LargeTokenInput balance is taking 100%, so the token selector takes its minWidth
export const LargeSxProps = { minWidth: 'unset' }
