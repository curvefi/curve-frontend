import type { CurveNetworkId, LlamaNetworkId } from '@ui-kit/features/connect-wallet/lib/types'
import type { AppName } from '@ui-kit/shared/routes'

export type Tab = 'terms' | 'privacy' | 'disclaimers'
export type DisclaimerTab = 'dex' | 'lend' | 'crvusd' | 'scrvusd'

export type TabProps = {
  currentApp: AppName
  network: CurveNetworkId | LlamaNetworkId
}
