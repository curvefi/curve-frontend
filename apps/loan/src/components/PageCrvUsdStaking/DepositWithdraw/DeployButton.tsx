import { t } from '@lingui/macro'

import useStore from '@/store/useStore'
import { useSignerAddress } from '@/entities/signer'

import Button from '@/ui/Button'
import React from 'react'

type DeployButtonProps = {
  className?: string
}

const DeployButton: React.FC<DeployButtonProps> = ({ className }) => {
  const { data: signerAddress } = useSignerAddress()
  const { approval: depositApproved, fetchStatus: depositFetchStatus } = useStore(
    (state) => state.scrvusd.depositApproval,
  )
  const { inputAmount, module, userBalances } = useStore((state) => state.scrvusd)

  const buttonTitle = depositApproved ? t`Deposit` : t`Approve`
  const approvalLoading = depositFetchStatus === 'loading'

  const isError =
    module === 'deposit'
      ? inputAmount > +userBalances[signerAddress?.toLowerCase() ?? '']?.crvUSD
      : inputAmount > +userBalances[signerAddress?.toLowerCase() ?? '']?.scrvUSD

  return (
    <Button variant="filled" loading={approvalLoading} className={className} disabled={isError || inputAmount === 0}>
      {buttonTitle}
    </Button>
  )
}

export default DeployButton
