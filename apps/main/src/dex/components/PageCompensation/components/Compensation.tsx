import { type ComponentProps, ReactNode, useCallback, useState } from 'react'
import { css, type IStyledComponent, styled } from 'styled-components'
import { getAddress } from 'viem'
import { AlertFormError } from '@/dex/components/AlertFormError'
import type { EtherContract } from '@/dex/components/PageCompensation/types'
import { curvejsApi } from '@/dex/lib/curvejs'
import { ChainId, CurveApi, Provider } from '@/dex/types/main.types'
import { shortenAddress } from '@evm-ui/utils'
import { Box } from '@legacy-ui/Box'
import { Button } from '@legacy-ui/Button'
import { IconButton } from '@legacy-ui/IconButton'
import { ExternalLink } from '@legacy-ui/Link/ExternalLink'
import { TxInfoBar } from '@legacy-ui/TxInfoBar'
import { scanAddressPath, scanTxPath } from '@legacy-ui/utils'
import { Hex } from '@primitives/address.utils'
import { formatNumber } from '@primitives/number.utils'
import { getErrorMessage } from '@ui/features/errors/errors.util'
import { notify } from '@ui/features/toast/Toast/notify'
import { ArrowTopRightIcon } from '@ui/icons/ArrowTopRightIcon'
import { CopyIcon } from '@ui/icons/CopyIcon'
import { copyToClipboard } from '@ui/lib/clipboard'
import { t } from '@ui/lib/i18n'

export const Compensation = ({
  chainId,
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
  chainId: ChainId
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
  const signerAddress = curve?.signerAddress
  const [claimState, setClaimState] = useState({
    signerAddress,
    revision: 0,
    error: '',
    step: '',
    txInfoBar: null as ReactNode,
  })
  const { error, step, txInfoBar, revision } = claimState

  if (claimState.signerAddress !== signerAddress) {
    setClaimState({ signerAddress, revision: revision + 1, error: '', step: '', txInfoBar: null })
  }

  const handleCloseErrorClick = useCallback(() => setClaimState(current => ({ ...current, step: '', error: '' })), [])

  const handleClaimClick = useCallback(
    async (_: string, contract: EtherContract['contract'], balance: number) => {
      if (!curve) return
      const notifyMessage = t`Please confirm claim ${balance} compensation.`
      const { dismiss } = notify(notifyMessage, 'pending')

      try {
        setClaimState(current => ({ ...current, step: 'claiming' }))
        const hash = (await contract.claim()) as Hex
        await curvejsApi.helpers.waitForTransaction(hash, provider)
        const txDescription = t`Claimed ${balance}`
        const txHash = scanTxPath(chainId, hash)
        // A revision also rejects stale results after switching from signer A to B and back to A.
        setClaimState(current =>
          current.revision === revision
            ? { ...current, step: 'claimed', txInfoBar: <TxInfoBar description={txDescription} txHash={txHash} /> }
            : current,
        )
      } catch (error) {
        console.error(error)
        setClaimState(current =>
          current.revision === revision
            ? { ...current, step: 'error', error: getErrorMessage(error, 'error-step-claim') }
            : current,
        )
      } finally {
        dismiss()
      }
    },
    [curve, chainId, provider, revision],
  )

  const formattedBalance =
    balance && formatNumber(balance, { minimumFractionDigits: 5, maximumFractionDigits: 5, abbreviate: false })

  const disabled =
    balance === 0 || haveBalancesError || !curve || step === 'claimed' || step === 'error' || step === 'claiming'
  const loading = (typeof balance === 'undefined' && !haveBalancesError) || step === 'claiming'

  return (
    <Box key={contractAddress} margin={!!error || !!txInfoBar ? '0 0 1rem 0' : '0'}>
      <Box flex flexJustifyContent="space-between" flexAlignItems="center" margin="0 0 1rem 0">
        <Box grid margin="0 1rem 0 0" gridRowGap={1}>
          <div>
            <strong>{token}</strong>{' '}
            <StyledExternalLink href={scanAddressPath(chainId, contractAddress)}>
              {shortenAddress(contractAddress)}
              <ArrowTopRightIcon sx={{ fontSize: 16 }} />
            </StyledExternalLink>
            <StyledIconButton size="medium" onClick={() => void copyToClipboard(getAddress(contractAddress))}>
              <CopyIcon sx={{ fontSize: 16 }} />
            </StyledIconButton>
          </div>
          {((formattedBalance && token === 'CRV') || vestedTotal > 0) && (
            <div>
              <strong>Remaining vested:</strong>{' '}
              {vestedTotal > 0
                ? formatNumber(vestedTotal, { minimumFractionDigits: 5, maximumFractionDigits: 5, abbreviate: false })
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
            onClick={() => void handleClaimClick(activeKey, contract, balance)}
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

const actionStyles = css`
  align-items: center;
  display: inline-flex;

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

const StyledIconButton: IStyledComponent<'web', ComponentProps<typeof IconButton>> = styled(IconButton)`
  ${actionStyles}
`
