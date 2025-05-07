import { requireLib } from '@ui-kit/features/connect-wallet'
import { type LlamaApi } from './types/loan.types'

// combined object to use the useConnection() hook, this will be replaced by llamalend-js soon
export type TempApi = LlamaApi

export const requireStablecoin = () => requireLib<LlamaApi>()
