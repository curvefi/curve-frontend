import React from 'react'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'

import Box from '@/ui/Box'
import DetailsBalancedAmount from '@/components/PagePool/Withdraw/components/DetailsBalancedAmount'

type Props = {
  expectedAmounts: string[]
  isError: boolean
}

const FormWithdrawBalanced: React.FC<Props> = ({ expectedAmounts, isError }) => {
  const { tokens } = usePoolContext()
  const { formValues } = useWithdrawContext()

  const { lpToken } = formValues

  const haveLpToken = Number(lpToken) > 0

  return (
    <Box as="ul" grid gridRowGap={2}>
      {tokens.map((tokenObj, idx) => (
        <DetailsBalancedAmount
          key={`${tokenObj.address}${idx}`}
          tokenObj={tokenObj}
          value={haveLpToken ? (isError ? '?' : expectedAmounts[idx] ?? '-') : '0'}
        />
      ))}
    </Box>
  )
}

export default FormWithdrawBalanced
