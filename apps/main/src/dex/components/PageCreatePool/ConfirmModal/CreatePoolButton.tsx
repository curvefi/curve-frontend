import { styled } from 'styled-components'
import { InfoLinkBar } from '@/dex/components/PageCreatePool/ConfirmModal/CreateInfoLinkBar'
import { useNetworks } from '@/dex/entities/networks'
import { curveProps } from '@/dex/lib/utils'
import { useStore } from '@/dex/store/useStore'
import { CurveApi } from '@/dex/types/main.types'
import { AlertBox } from '@ui/AlertBox'
import { Button } from '@ui/Button'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

interface Props {
  disabled: boolean
  curve: CurveApi
}

export const CreatePoolButton = ({ disabled, curve }: Props) => {
  const { data: networks } = useNetworks()
  const { haveSigner } = curveProps(curve, networks)
  const deployPool = useStore((state) => state.createPool.deployPool)
  const txStatus = useStore((state) => state.createPool.transactionState.txStatus)
  const txSuccess = useStore((state) => state.createPool.transactionState.txSuccess)
  const txLink = useStore((state) => state.createPool.transactionState.txLink)
  const poolId = useStore((state) => state.createPool.transactionState.poolId)
  const errorMessage = useStore((state) => state.createPool.transactionState.errorMessage)
  const { connectState, connect: connectWallet } = useWallet()

  return !haveSigner ? (
    <StyledButton variant="filled" onClick={() => connectWallet()} loading={isLoading(connectState)}>
      {t`Connect Wallet`}
    </StyledButton>
  ) : (
    <>
      {txSuccess && <InfoLinkBar description={t`Tx: ${poolId} created`} link={txLink} />}
      {txStatus === 'ERROR' && (
        <StyledAlertBox alertType="error" limitHeight>
          {errorMessage}
        </StyledAlertBox>
      )}
      {(txStatus === '' || txStatus === 'ERROR') && (
        <StyledButton disabled={disabled} variant={'icon-filled'} onClick={() => deployPool(curve)}>
          {t`Create Pool`}
        </StyledButton>
      )}
      {(txStatus === 'LOADING' || txStatus === 'CONFIRMING') && (
        <StyledSpinnerWrapper>
          {t`Create Pool`}
          <StyledSpinner isDisabled size={15} />
        </StyledSpinnerWrapper>
      )}
      {txStatus === 'SUCCESS' && <SuccessWrapper>{t`Pool Creation Complete`}</SuccessWrapper>}
    </>
  )
}

const StyledButton = styled(Button)`
  padding: var(--spacing-2) var(--spacing-4);
  width: 100%;
  display: flex;
  margin: var(--spacing-narrow) auto 0;
  justify-content: center;
  &.success {
    color: var(--success-400);
    border: 2px solid var(--success-400);
    background-color: var(--success-600);
  }
`

const StyledAlertBox = styled(AlertBox)`
  width: 100%;
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: var(--spacing-2) var(--spacing-4);
  width: 100%;
  display: flex;
  margin: var(--spacing-3) auto 0;

  text-transform: var(--input_button--text-transform);

  font-family: var(--button--font);
  font-weight: var(--button--font-weight);
  color: var(--box_action--button--loading--color);
  background-color: var(--box_action--button--loading--background-color);
  box-shadow: 3px 3px var(--box_action--button--loading--shadow-color);
`

const SuccessWrapper = styled.div`
  padding: var(--spacing-2) var(--spacing-4);
  width: 100%;
  display: flex;
  margin: var(--spacing-narrow) auto 0;
  justify-content: center;
  font-family: var(--button--font);

  text-transform: var(--input_button--text-transform);

  font-weight: var(--button--font-weight);
  color: var(--success-400);
  border: 2px solid var(--success-400);
  background-color: var(--success-600);
`

const StyledSpinner = styled(Spinner)`
  margin-left: var(--spacing-2);
  > div {
    border-color: var(--box_action--button--loading--color) transparent transparent transparent;
  }
`
