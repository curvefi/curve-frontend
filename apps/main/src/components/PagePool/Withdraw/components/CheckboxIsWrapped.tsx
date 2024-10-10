import React from 'react'
import { t } from '@lingui/macro'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'
import networks from '@/networks'

import Checkbox from '@/ui/Checkbox'

const CheckboxIsWrapped = () => {
  const { rChainId, hasWrapped, isWrapped, poolId = '', setPoolIsWrapped } = usePoolContext()
  const { isDisabled: formIsDisabled } = useWithdrawContext()

  const { poolIsWrappedOnly } = networks[rChainId]

  const isDisabled = formIsDisabled || !poolId || poolIsWrappedOnly[poolId]

  return (
    <>
      {hasWrapped && (
        <Checkbox
          isDisabled={isDisabled}
          isSelected={isWrapped}
          onChange={(isWrapped) => poolId && setPoolIsWrapped(poolId, isWrapped)}
        >
          {t`Withdraw Wrapped`}
        </Checkbox>
      )}
    </>
  )
}

export default CheckboxIsWrapped
