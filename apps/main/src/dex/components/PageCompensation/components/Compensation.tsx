import { ReactNode, useCallback, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { AlertFormError } from '@/dex/components/AlertFormError'
import type { EtherContract } from '@/dex/components/PageCompensation/types'
import { StyledIconButton } from '@/dex/components/PagePool/PoolDetails/PoolStats/styles'
import { useNetworkByChain } from '@/dex/entities/networks'
import { curvejsApi } from '@/dex/lib/curvejs'
import { ChainId, CurveApi, Provider } from '@/dex/types/main.types'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { TxInfoBar } from '@ui/TxInfoBar'
import { formatNumber, scanAddressPath, scanTxPath } from '@ui/utils'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { copyToClipboard, getErrorMessage, shortenAddress } from '@ui-kit/utils'

export const Compensation = ({
  rChainId,
  activeKey,
  curve,
  contract,
  contractAddress,
  balance,
  provider,
  haveBalancesError,
  token,
  vestedTotal,
}: {
  rChainId: ChainId
  activeKey: string
  curve: CurveApi | null
  contract: EtherContract['contract']
  contractAddress: string
  balance: number
  provider: Provider
  haveBalancesError: boolean
  token: string
  vestedTotal: number
}) => {
  const { data: network } = useNetworkByChain({ chainId: rChainId })

  const [error, setError] = useState('')
  const [step, setStep] = useState('')
  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const handleCloseErrorClick = useCallback(() => {
    setStep('')
    setError('')
  }, [])

  const handleClaimClick = useCallback(
    async (_: string, contract: EtherContract['contract'], balance: number) => {
      if (!curve) return
      const notifyMessage = t`Please confirm claim ${balance} compensation.`
      const { dismiss } = notify(notifyMessage, 'pending')

      try {
        setStep('claiming')
        const hash = await contract.claim()
        await curvejsApi.helpers.waitForTransaction(hash, provider)
        setStep('claimed')
        const txDescription = t`Claimed ${balance}`
        const txHash = scanTxPath(network, hash)
        setTxInfoBar(<TxInfoBar description={txDescription} txHash={txHash} />)
        if (typeof dismiss === 'function') dismiss()
      } catch (error) {
        console.error(error)
        setStep('error')
        setError(getErrorMessage(error, 'error-step-claim'))
        if (typeof dismiss === 'function') dismiss()
      }
    },
    [curve, network, provider],
  )

  // reset
  useEffect(() => {
    setError('')
    setStep('')
    setTxInfoBar(null)
  }, [curve?.signerAddress])

  const formattedBalance = balance && formatNumber(balance, { minimumFractionDigits: 5, maximumFractionDigits: 5 })

  const disabled =
    balance === 0 || haveBalancesError || !curve || step === 'claimed' || step === 'error' || step === 'claiming'
  const loading = (typeof balance === 'undefined' && !haveBalancesError) || step === 'claiming'

  return (
    <Box key={contractAddress} margin={!!error || !!txInfoBar ? '0 0 1rem 0' : '0'}>
      <Box flex flexJustifyContent="space-between" flexAlignItems="center" margin="0 0 1rem 0">
        <Box grid margin="0 1rem 0 0" gridRowGap={1}>
          <div>
            <strong>{token}</strong>{' '}
            {network && (
              <StyledExternalLink href={scanAddressPath(network, contractAddress)}>
                {shortenAddress(contractAddress)}
                <Icon name="Launch" size={16} />
              </StyledExternalLink>
            )}
            <StyledIconButton size="medium" onClick={() => copyToClipboard(contractAddress)}>
              <Icon name="Copy" size={16} />
            </StyledIconButton>
          </div>
          {((formattedBalance && token === 'CRV') || vestedTotal > 0) && (
            <div>
              <strong>Remaining vested:</strong>{' '}
              {vestedTotal > 0
                ? formatNumber(vestedTotal, { minimumFractionDigits: 5, maximumFractionDigits: 5 })
                : '-'}
            </div>
          )}
          {formattedBalance ? (
            <div>
              <strong>Claim amount: {formattedBalance}</strong>
            </div>
          ) : null}
        </Box>
        <Box>
          <Button
            disabled={disabled}
            loading={loading}
            variant="filled"
            onClick={() => handleClaimClick(activeKey, contract, balance)}
          >
            {step || `Claim`}
          </Button>
        </Box>
      </Box>
      {!!error && <AlertFormError errorKey={error} handleBtnClose={handleCloseErrorClick} />}
      {!!txInfoBar && txInfoBar}
    </Box>
  )
}

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-size: var(--font-size-2);

  svg {
    padding-top: 0.3125rem;
  }
`
