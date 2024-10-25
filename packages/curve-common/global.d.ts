// Extend the Window interface
import { EIP1193Provider } from '@web3-onboard/common/dist/types'

declare global {
  declare module '*.png'
  interface Window {
    bitkeep?: EIP1193Provider & { ethereum: EIP1193Provider }
    ethereum: EIP1193Provider & { isBitKeep?: boolean }
  }
}
