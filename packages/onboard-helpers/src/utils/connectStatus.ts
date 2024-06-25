import { WalletState } from '@web3-onboard/core'

export enum CONNECT_STAGE {
  'CONNECT_API' = 'connect-api',
  'CONNECT_WALLET' = 'connect-wallet',
  'SWITCH_NETWORK' = 'switch-network',
  'DISCONNECT_WALLET' = 'disconnect-wallet',
}

export interface ConnectOptions {
  [CONNECT_STAGE.CONNECT_API]: [number, boolean]
  [CONNECT_STAGE.CONNECT_WALLET]: string | undefined
  [CONNECT_STAGE.SWITCH_NETWORK]: [number, number]
  [CONNECT_STAGE.DISCONNECT_WALLET]: WalletState
}

export type ConnectState = {
  status: 'loading' | 'success' | 'failure' | ''
  stage: CONNECT_STAGE | ''
  options?: ConnectOptions[CONNECT_STAGE]
}

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

export function isLoading(connectState: ConnectState, stage?: CONNECT_STAGE | CONNECT_STAGE[]) {
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
