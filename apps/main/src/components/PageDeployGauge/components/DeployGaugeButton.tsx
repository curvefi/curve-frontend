import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import useStore from '@/store/useStore'
import { curveProps } from '@/lib/utils'
import networks from '@/networks'
import { shortenTokenAddress } from '@/utils'

import Button from '@/ui/Button'
import Spinner, { SpinnerWrapper } from '@/ui/Spinner'
import AlertBox from '@/ui/AlertBox'
import InfoLinkBar from '@/components/PageCreatePool/ConfirmModal/CreateInfoLinkBar'

interface Props {
  disabled: boolean
  chainId: ChainId
  curve: CurveApi
}

type InfoLinkBar = {
  mainnetGaugeLinkBar: React.ReactNode | null
  sidechainGaugeLinkBar: React.ReactNode | null
  mirrorGaugeLinkBar: React.ReactNode | null
}

const DeployGaugeButton = ({ disabled, chainId, curve }: Props) => {
  const routerProps = useStore((state) => state.routerProps)
  const { haveSigner } = curveProps(curve)
  const navigate = useNavigate()
  const { params, location } = routerProps || {}

  const { resetState, lpTokenAddress, currentPoolType, sidechainGauge, sidechainNav, deploymentStatus, deployGauge } =
    useStore((state) => state.deployGauge)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWalletStoreByKey = useStore((state) => state.wallet.updateWalletStoreByKey)
  const isLoadingApi = useStore((state) => state.isLoadingApi)

  // cleanup and reset on dismount if success
  // useEffect(() => {
  //   return () => {
  //     if (success) {
  //       setSuccess(false)
  //       // resetState()
  //     }
  //   }
  // }, [resetState, success, setSuccess])

  const handleConnectEth = () => {
    if (location?.pathname && params?.network) {
      updateWalletStoreByKey('isNetworkChangedFromApp', true)
      updateGlobalStoreByKey('isLoadingApi', true)
      navigate(location.pathname.replace(`/${params.network}`, `/${networks[1].name.toLowerCase()}`))
    }
  }

  const handleClick = async () => {
    if (sidechainGauge) {
      if (sidechainNav === 0) {
        if (currentPoolType === 'Stableswap') deployGauge(curve, 'STABLENG', 'SIDECHAINGAUGE')
        if (currentPoolType === 'Stableswap (Old)') deployGauge(curve, 'STABLEOLD', 'SIDECHAINGAUGE')
        if (currentPoolType === 'Two Coin Cryptoswap') deployGauge(curve, 'TWOCRYPTO', 'SIDECHAINGAUGE')
        if (currentPoolType === 'Three Coin Cryptoswap') deployGauge(curve, 'THREECRYPTO', 'SIDECHAINGAUGE')
      }
      if (sidechainNav === 1) {
        if (currentPoolType === 'Stableswap') deployGauge(curve, 'STABLENG', 'MIRRORGAUGE')
        if (currentPoolType === 'Stableswap (Old)') deployGauge(curve, 'STABLEOLD', 'MIRRORGAUGE')
        if (currentPoolType === 'Two Coin Cryptoswap') deployGauge(curve, 'TWOCRYPTO', 'MIRRORGAUGE')
        if (currentPoolType === 'Three Coin Cryptoswap') deployGauge(curve, 'THREECRYPTO', 'MIRRORGAUGE')
      }
    }
    if (!sidechainGauge) {
      if (currentPoolType === 'Stableswap') deployGauge(curve, 'STABLENG', 'MAINNETGAUGE')
      if (currentPoolType === 'Stableswap (Old)') deployGauge(curve, 'STABLEOLD', 'MAINNETGAUGE')
      if (currentPoolType === 'Two Coin Cryptoswap') deployGauge(curve, 'TWOCRYPTO', 'MAINNETGAUGE')
      if (currentPoolType === 'Three Coin Cryptoswap') deployGauge(curve, 'THREECRYPTO', 'MAINNETGAUGE')
    }
  }

  return sidechainGauge ? (
    // sidechain / mirror gauge logic

    // on Mirror gauge step but not connected to Ethereum
    sidechainNav === 1 && chainId !== 1 ? (
      !isLoadingApi ? (
        <StyledButton variant={'icon-filled'} onClick={() => handleConnectEth()}>
          {t`Connect to Ethereum`}
        </StyledButton>
      ) : (
        <StyledSpinnerWrapper>
          {t`Connecting`}
          <StyledSpinner isDisabled size={15} />
        </StyledSpinnerWrapper>
      ) // no signer
    ) : !haveSigner ? (
      <StyledButton variant="filled" onClick={updateConnectWalletStateKeys}>
        {t`Connect Wallet`}
      </StyledButton>
    ) : (
      <>
        {sidechainNav === 0
          ? deploymentStatus.sidechain.transaction &&
            deploymentStatus.sidechain.status === 'SUCCESS' && (
              <InfoLinkBarWrapper>
                <StyledInfoLinkBar
                  description={t`Tx: Gauge for ${shortenTokenAddress(lpTokenAddress)} deployed`}
                  link={networks[chainId].scanTxPath(deploymentStatus.sidechain.transaction.hash)}
                />
              </InfoLinkBarWrapper>
            )
          : deploymentStatus.mirror.transaction &&
            deploymentStatus.mirror.status === 'SUCCESS' && (
              <InfoLinkBarWrapper>
                <StyledInfoLinkBar
                  description={t`Tx: Gauge for ${shortenTokenAddress(lpTokenAddress)} deployed`}
                  link={networks[chainId].scanTxPath(deploymentStatus.mirror.transaction.hash)}
                />
              </InfoLinkBarWrapper>
            )}
        {sidechainNav === 0
          ? deploymentStatus.sidechain.status === 'SUCCESS' && (
              <SuccessWrapper>{t`Sidechain gauge successfully deployed`}</SuccessWrapper>
            )
          : deploymentStatus.mirror.status === 'SUCCESS' && (
              <SuccessWrapper>{t`Mirror gauge successfully deployed`}</SuccessWrapper>
            )}

        {sidechainNav === 0
          ? deploymentStatus.sidechain.status === 'ERROR' && (
              <StyledAlertBox alertType="error">{deploymentStatus.sidechain.errorMessage}</StyledAlertBox>
            )
          : deploymentStatus.mirror.status === 'ERROR' && (
              <StyledAlertBox alertType="error">{deploymentStatus.mirror.errorMessage}</StyledAlertBox>
            )}

        {sidechainNav === 0
          ? deploymentStatus.sidechain.status !== 'LOADING' &&
            deploymentStatus.sidechain.status !== 'CONFIRMING' && (
              <StyledButton disabled={disabled} variant={'icon-filled'} onClick={() => handleClick()}>
                {t`Deploy Sidechain Gauge`}
              </StyledButton>
            )
          : deploymentStatus.mirror.status !== 'LOADING' &&
            deploymentStatus.mirror.status !== 'CONFIRMING' && (
              <StyledButton disabled={disabled} variant={'icon-filled'} onClick={() => handleClick()}>
                {t`Deploy Mirror Gauge`}
              </StyledButton>
            )}
        {sidechainNav === 0
          ? (deploymentStatus.sidechain.status === 'LOADING' || deploymentStatus.sidechain.status === 'CONFIRMING') && (
              <StyledSpinnerWrapper>
                {t`Deploying Sidechain Gauge`}
                <StyledSpinner isDisabled size={15} />
              </StyledSpinnerWrapper>
            )
          : (deploymentStatus.mirror.status === 'LOADING' || deploymentStatus.mirror.status === 'CONFIRMING') && (
              <StyledSpinnerWrapper>
                {t`Deploying Mirror Gauge`}
                <StyledSpinner isDisabled size={15} />
              </StyledSpinnerWrapper>
            )}
      </>
    )
  ) : // mainnet gauge logic
  chainId !== 1 ? (
    !isLoadingApi ? (
      <StyledButton variant={'icon-filled'} onClick={() => handleConnectEth()}>
        {t`Connect to Ethereum`}
      </StyledButton>
    ) : (
      <StyledSpinnerWrapper>
        {t`Connecting`}
        <StyledSpinner isDisabled size={15} />
      </StyledSpinnerWrapper>
    )
  ) : !haveSigner ? (
    <StyledButton variant="filled" onClick={updateConnectWalletStateKeys}>
      {t`Connect Wallet`}
    </StyledButton>
  ) : (
    <>
      {deploymentStatus.mainnet.transaction && deploymentStatus.mainnet.status === 'SUCCESS' && (
        <InfoLinkBarWrapper>
          <StyledInfoLinkBar
            description={t`Tx: Gauge for ${shortenTokenAddress(lpTokenAddress)} deployed`}
            link={networks[chainId].scanTxPath(deploymentStatus.mainnet.transaction.hash)}
          />
        </InfoLinkBarWrapper>
      )}
      {deploymentStatus.mainnet.status === 'ERROR' && (
        <StyledAlertBox alertType="error" limitHeight>
          {deploymentStatus.mainnet.errorMessage}
        </StyledAlertBox>
      )}
      {deploymentStatus.mainnet.status === 'SUCCESS' && (
        <SuccessWrapper>{t`Gauge Deployed Successfully`}</SuccessWrapper>
      )}
      {deploymentStatus.mainnet.status !== 'LOADING' && deploymentStatus.mainnet.status !== 'CONFIRMING' && (
        <StyledButton disabled={disabled} variant={'icon-filled'} onClick={() => handleClick()}>
          {t`Deploy Gauge`}
        </StyledButton>
      )}
      {(deploymentStatus.mainnet.status === 'LOADING' || deploymentStatus.mainnet.status === 'CONFIRMING') && (
        <StyledSpinnerWrapper>
          {t`Deploying Gauge`}
          <StyledSpinner isDisabled size={15} />
        </StyledSpinnerWrapper>
      )}
    </>
  )
}

const StyledButton = styled(Button)`
  padding: var(--spacing-2) var(--spacing-4);
  width: 100%;
  display: flex;
  margin: 0 auto 0;
  justify-content: center;
  &.success {
    color: var(--success-400);
    border: 2px solid var(--success-400);
    background-color: var(--success-600);
  }
`

const StyledAlertBox = styled(AlertBox)`
  width: 100%;
  margin-bottom: var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: var(--spacing-2) var(--spacing-4);
  width: 100%;
  display: flex;
  margin: 0 auto 0;

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
  margin: 0 auto var(--spacing-2);
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

const StyledInfoLinkBar = styled(InfoLinkBar)`
  margin-top: 0;
  margin-bottom: var(--spacing-2);
`

const InfoLinkBarWrapper = styled.div`
  display: flex;
  @media (min-width: 39.375rem) {
    display: none;
  }
`

export default DeployGaugeButton
