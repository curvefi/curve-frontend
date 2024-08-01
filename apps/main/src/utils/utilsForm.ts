import React from 'react'
import networks from '@/networks'

export function handleSubmitResp(
  activeKey: string,
  isSubscribed: React.MutableRefObject<boolean>,
  curve: CurveApi,
  dismiss: () => void,
  resp: FnStepResponse | undefined,
  setTxInfoBar: React.Dispatch<React.SetStateAction<React.ReactNode>>
) {
  if (!isSubscribed.current) return

  if (typeof dismiss === 'function') dismiss()

  if (resp?.error) {
    setTxInfoBar(null)
    return
  }

  if (!resp || !resp.hash || resp?.activeKey !== activeKey) return

  return networks[curve.chainId].scanTxPath(resp.hash)
}
