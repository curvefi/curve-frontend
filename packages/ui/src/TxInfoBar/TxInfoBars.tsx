import React, { useMemo } from 'react'

import TxInfoBarComp, { TxHashError } from 'ui/src/TxInfoBar'

type Props = {
  label?: string
  data: { success: string[] } | undefined
  error: TxHashError | null
  scanTxPath: (hash: string) => string
}

const TxInfoBars: React.FC<Props> = ({ label = 'spending', data, error, scanTxPath }) => {
  const { success } = data ?? {}
  const { success: successInError, failed } = error?.data ?? {}

  const successHashes = useMemo(() => [...(success ?? successInError ?? [])], [success, successInError])
  const failedHashes = useMemo(() => [...(failed ?? [])], [failed])

  return (
    <>
      {(successHashes.length > 0 || failedHashes.length > 0) && (
        <>
          {successHashes.map((tx) => (
            <TxInfoBarComp
              key={tx}
              description={`View ${label} success tx (${shortenTokenAddress(tx)})`}
              txHash={scanTxPath(tx)}
            />
          ))}
          {failedHashes.map((tx) => (
            <TxInfoBarComp
              key={tx}
              description={`View ${label} failed tx (${shortenTokenAddress(tx)})`}
              txHash={scanTxPath(tx)}
            />
          ))}
        </>
      )}
    </>
  )
}

function shortenTokenAddress(tokenAddress: string, startOnly?: boolean) {
  if (!tokenAddress) return
  const start = tokenAddress.slice(0, 4)
  const end = tokenAddress.slice(-4)
  return startOnly ? start : `${start}...${end}`
}

export default TxInfoBars
