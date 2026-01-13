import { Address } from '@ui-kit/utils'

export type TokenOption = {
  address: Address
  symbol: string
  chain?: string
  /** Optional name for the token, displayed with slightly more emphasis than `label` */
  name?: string
  /** Optional descriptive label for the token, currently often misused to display the `name` */
  label?: string
  volume?: number
}

export const tokenOptionEquals = (a?: TokenOption, b?: TokenOption) => a?.address == b?.address && a?.chain == b?.chain
