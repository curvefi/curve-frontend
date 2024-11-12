import type { EtherContract } from '@/components/PageCompensation/types'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useState } from 'react'
import numbro from 'numbro'
import styled from 'styled-components'
import { copyToClipboard } from '@/lib/utils'
import { getErrorMessage, shortenTokenAddress } from '@/utils'
import curvejsApi from '@/lib/curvejs'
import useStore from '@/store/useStore'
import { StyledIconButton } from '@/components/PagePool/PoolDetails/PoolStats/styles'
import AlertFormError from '@/components/AlertFormError'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import ExternalLink from '@/ui/Link/ExternalLink'
import Icon from '@/ui/Icon'
import TxInfoBar from '@/ui/TxInfoBar'

const Compensation = ({
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
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const fetchGasInfo = useStore((state) => state.gas.fetchGasInfo)
  const networks = useStore((state) => state.networks.networks)

  const [error, setError] = useState('')
  const [step, setStep] = useState('')
  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const handleCloseErrorClick = useCallback(() => {
    setStep('')
    setError('')
  }, [])

  const handleClaimClick = useCallback(
    async (activeKey: string, contract: EtherContract['contract'], balance: number) => {
      if (!curve) return
      const notifyMessage = t`Please confirm claim ${balance} compensation.`
      const { dismiss } = notifyNotification(notifyMessage, 'pending')

      try {
        setStep('claiming')
        await fetchGasInfo(curve)
        const hash = await contract.claim()
        await curvejsApi.helpers.waitForTransaction(hash, provider)
        setStep('claimed')
        const txDescription = t`Claimed ${balance}`
        const network = networks[curve.chainId]
        const txHash = network.scanTxPath(hash)
        setTxInfoBar(<TxInfoBar description={txDescription} txHash={txHash} />)
        if (typeof dismiss === 'function') dismiss()
      } catch (error) {
        console.error(error)
        setStep('error')
        setError(getErrorMessage(error, 'error-step-claim'))
        if (typeof dismiss === 'function') dismiss()
      }
    },
    [curve, notifyNotification, fetchGasInfo, provider, networks],
  )

  // reset
  useEffect(() => {
    setError('')
    setStep('')
    setTxInfoBar(null)
  }, [curve?.signerAddress])

  let formattedBalance = null
  if (typeof balance !== 'undefined' && !haveBalancesError) {
    if (balance === 0) {
      formattedBalance = 0
    } else {
      formattedBalance = numbro(balance).format({
        thousandSeparated: true,
        mantissa: 5,
        trimMantissa: false,
      })
    }
  }

  const disabled =
    balance === 0 || haveBalancesError || !curve || step === 'claimed' || step === 'error' || step === 'claiming'
  const loading = (typeof balance === 'undefined' && !haveBalancesError) || step === 'claiming'

  return (
    <Box key={contractAddress} margin={!!error || !!txInfoBar ? '0 0 1rem 0' : '0'}>
      <Box flex flexJustifyContent="space-between" flexAlignItems="center" margin="0 0 1rem 0">
        <Box grid margin="0 1rem 0 0" gridRowGap={1}>
          <div>
            <strong>{token}</strong>{' '}
            <StyledExternalLink href={networks[rChainId].scanAddressPath(contractAddress)}>
              {shortenTokenAddress(contractAddress)}
              <Icon name="Launch" size={16} />
            </StyledExternalLink>
            <StyledIconButton size="medium" onClick={() => copyToClipboard(contractAddress)}>
              <Icon name="Copy" size={16} />
            </StyledIconButton>
          </div>
          {((formattedBalance && token === 'CRV') || vestedTotal > 0) && (
            <div>
              <strong>Remaining vested:</strong>{' '}
              {vestedTotal > 0
                ? numbro(vestedTotal).format({
                    thousandSeparated: true,
                    mantissa: 5,
                    trimMantissa: false,
                  })
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

export default Compensation
