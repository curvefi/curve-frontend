import React from 'react'

import { useDepositContext } from '@/components/PagePool/Deposit/contextDeposit'
import { usePoolContext } from '@/components/PagePool/contextPool'

import FieldAmount from '@/components/PagePool/Deposit/components/FieldAmount'

type Props = {
  estimatedGas: EstimatedGas
}

const FieldsAmount: React.FC<Props> = ({ estimatedGas }) => {
  const { tokensMapper } = usePoolContext()
  const { formValues } = useDepositContext()

  const { amounts } = formValues

  return (
    <>
      {amounts.map((amount, idx) => {
        const tokenObj = tokensMapper[amount.tokenAddress]
        return <FieldAmount key={`field${idx}`} idx={idx} {...amount} tokenObj={tokenObj} estimatedGas={estimatedGas} />
      })}
    </>
  )
}

export default FieldsAmount
