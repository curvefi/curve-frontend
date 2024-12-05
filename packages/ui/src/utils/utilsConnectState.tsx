export type ConnectState = {
  status: 'loading' | 'success' | 'failure' | ''
  stage: 'api' | 'connect-wallet' | 'switch-network' | 'disconnect-wallet' | ''
  options?: any[] | undefined
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const

export function isSuccess(connectState: ConnectState) {
  return connectState.status === 'success'
}

export function isFailure(connectState: ConnectState, stage?: string) {
  if (stage) {
    return connectState.status === 'failure' && connectState.stage.startsWith(stage)
  } else {
    return connectState.status === 'failure'
  }
}

export function isLoading(connectState: ConnectState, stage?: string | string[]) {
  if (connectState.status !== 'loading') {
    return false
  } else {
    switch (typeof stage) {
      case 'string':
        return connectState.stage.startsWith(stage)
      case 'object':
        return stage.some((s) => connectState.stage.startsWith(s))
      default:
        return true
    }
  }
}
