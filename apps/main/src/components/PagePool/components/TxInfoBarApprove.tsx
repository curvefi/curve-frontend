import React from 'react'
import { t } from '@lingui/macro'

import { usePoolContext } from '@/components/PagePool/contextPool'
import networks from '@/networks'

import TxInfoBarComp from '@/ui/TxInfoBar'

type Props = {
  isSuccess: boolean
  hashes: string[]
}

const TxInfoBarApprove: React.FC<Props> = ({ isSuccess, hashes }) => {
  const { rChainId } = usePoolContext()

  const { scanTxPath } = networks[rChainId]

  return (
    <>
      {isSuccess && hashes && (
        <TxInfoBarComp description={t`View transaction detail`} txHash={hashes.map((hash) => scanTxPath(hash))} />
      )}
    </>
  )
}

export default TxInfoBarApprove
