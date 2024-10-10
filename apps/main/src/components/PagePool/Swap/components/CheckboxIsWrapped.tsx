import React from 'react'
import { t } from '@lingui/macro'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { useSwapContext } from '@/components/PagePool/Swap/contextSwap'
import networks from '@/networks'

import Checkbox from '@/ui/Checkbox'

const CheckboxIsWrapped = () => {
  const { rChainId, rPoolId, hasWrapped, isWrapped, poolId, setPoolIsWrapped } = usePoolContext()
  const { isDisabled: formIsDisabled } = useSwapContext()

  const { poolIsWrappedOnly } = networks[rChainId]

  const isDisabled = formIsDisabled || poolIsWrappedOnly[rPoolId]

  return (
    <>
      {hasWrapped && (
        <div>
          <Checkbox
            isDisabled={isDisabled}
            isSelected={isWrapped}
            onChange={(isWrapped) => poolId && setPoolIsWrapped(poolId, isWrapped)}
          >
            {t`Swap Wrapped`}
          </Checkbox>
        </div>
      )}
    </>
  )
}

export default CheckboxIsWrapped
