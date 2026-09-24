import { useState } from 'react'
import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import type { StellarNetwork } from '@/stellar/lib/networks'
import { useTrustlineMutation } from '@/stellar/mutations/trustline.mutation'
import Button from '@mui/material/Button'
import { t } from '@ui/lib/i18n'

type TrustlineButtonsProps = { network: StellarNetwork; tokens: StellarContract[] }

/** Adds every missing pool-token trustline, one wallet transaction at a time. */
export const TrustlineButtons = ({ network, tokens }: TrustlineButtonsProps) => {
  const { mutateAsync, isPending } = useTrustlineMutation(network)
  const [isAdding, setIsAdding] = useState(false)

  if (!tokens.length) return null

  const addTrustlines = async () => {
    setIsAdding(true)
    try {
      for (const token of tokens) await mutateAsync({ token })
    } catch {
      // The transaction mutation already reports the failure and preserves its error state.
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      type="button"
      fullWidth
      loading={isAdding || isPending}
      disabled={isAdding || isPending}
      onClick={() => void addTrustlines()}
      data-testid="stellar-add-trustlines"
    >
      {isAdding || isPending ? t`Adding trustlines...` : t`Add trustlines`}
    </Button>
  )
}
