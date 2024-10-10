import { t } from '@lingui/macro'

import { useDepositContext } from '@/components/PagePool/Deposit/contextDeposit'
import { usePoolContext } from '@/components/PagePool/contextPool'
import networks from '@/networks'

import { FieldsWrapper } from '@/components/PagePool/styles'
import Checkbox from '@/ui/Checkbox'

const CheckboxIsWrapped = () => {
  const { rChainId, rPoolId, hasWrapped, isWrapped, poolId, isSeed, setPoolIsWrapped } = usePoolContext()
  const { isDisabled: formIsDisabled } = useDepositContext()

  const { poolIsWrappedOnly } = networks[rChainId]

  const isDisabled = formIsDisabled || poolIsWrappedOnly[rPoolId] || !!isSeed

  return (
    <>
      {hasWrapped && (
        <FieldsWrapper>
          <Checkbox
            isDisabled={isDisabled}
            isSelected={isWrapped}
            onChange={(isWrapped) => {
              if (poolId) setPoolIsWrapped(poolId, isWrapped)
            }}
          >
            {t`Deposit Wrapped`}
          </Checkbox>
        </FieldsWrapper>
      )}
    </>
  )
}

export default CheckboxIsWrapped
