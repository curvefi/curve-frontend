import { styled } from 'styled-components'
import { InfoLinkBar } from '@/dex/components/PageCreatePool/ConfirmModal/CreateInfoLinkBar'
import {
  STABLESWAP,
  STABLESWAPOLD,
  THREECOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAP,
  TWOCOINCRYPTOSWAPNG,
} from '@/dex/components/PageDeployGauge/constants'
import { useNetworks } from '@/dex/entities/networks'
import { curveProps } from '@/dex/lib/utils'
import { useStore } from '@/dex/store/useStore'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { getPath, useRestFullPathname } from '@/dex/utils/utilsRouter'
import { AlertBox } from '@ui/AlertBox'
import { Button } from '@ui/Button'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { scanTxPath } from '@ui/utils'
import { isLoading, useWallet } from '@ui-kit/features/connect-wallet'
import { useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '@ui-kit/utils'

interface Props {
  disabled: boolean
  chainId: ChainId
  curve: CurveApi | null
  pageLoaded: boolean
}

export const DeployGaugeButton = ({ disabled, chainId, curve, pageLoaded }: Props) => {
  const { data: networks } = useNetworks()
  const { haveSigner } = curveProps(curve, networks)
  const isLite = networks[chainId]?.isLite ?? false
  const push = useNavigate()
  const lpTokenAddress = useStore((state) => state.deployGauge.lpTokenAddress)
  const currentPoolType = useStore((state) => state.deployGauge.currentPoolType)
  const sidechainGauge = useStore((state) => state.deployGauge.sidechainGauge)
  const sidechainNav = useStore((state) => state.deployGauge.sidechainNav)
  const deploymentStatus = useStore((state) => state.deployGauge.deploymentStatus)
  const deployGauge = useStore((state) => state.deployGauge.deployGauge)
  const { connectState, connect: connectWallet } = useWallet()
  const isLoadingApi = !pageLoaded
  const restFullPathname = useRestFullPathname()

  const handleConnectEth = () => push(getPath({ network: 'ethereum' }, `/${restFullPathname}`))

  const handleClick = async () => {
    if (!curve) throw new Error('No current curve')
    if (sidechainGauge) {
      if (sidechainNav === 0) {
        if (currentPoolType === STABLESWAPOLD) deployGauge(curve, 'STABLEOLD', 'SIDECHAINGAUGE', isLite)
        if (currentPoolType === STABLESWAP) deployGauge(curve, 'STABLENG', 'SIDECHAINGAUGE', isLite)
        if (currentPoolType === TWOCOINCRYPTOSWAP) deployGauge(curve, 'TWOCRYPTO', 'SIDECHAINGAUGE', isLite)
        if (currentPoolType === TWOCOINCRYPTOSWAPNG) deployGauge(curve, 'TWOCRYPTONG', 'SIDECHAINGAUGE', isLite)
        if (currentPoolType === THREECOINCRYPTOSWAP) deployGauge(curve, 'THREECRYPTO', 'SIDECHAINGAUGE', isLite)
      }
      if (sidechainNav === 1) {
        if (currentPoolType === STABLESWAPOLD) deployGauge(curve, 'STABLEOLD', 'MIRRORGAUGE')
        if (currentPoolType === STABLESWAP) deployGauge(curve, 'STABLENG', 'MIRRORGAUGE')
        if (currentPoolType === TWOCOINCRYPTOSWAP) deployGauge(curve, 'TWOCRYPTO', 'MIRRORGAUGE')
        if (currentPoolType === TWOCOINCRYPTOSWAPNG) deployGauge(curve, 'TWOCRYPTONG', 'MIRRORGAUGE')
        if (currentPoolType === THREECOINCRYPTOSWAP) deployGauge(curve, 'THREECRYPTO', 'MIRRORGAUGE')
      }
    }
    if (!sidechainGauge) {
      if (currentPoolType === STABLESWAPOLD) deployGauge(curve, 'STABLEOLD', 'MAINNETGAUGE')
      if (currentPoolType === STABLESWAP) deployGauge(curve, 'STABLENG', 'MAINNETGAUGE')
      if (currentPoolType === TWOCOINCRYPTOSWAP) deployGauge(curve, 'TWOCRYPTO', 'MAINNETGAUGE')
      if (currentPoolType === TWOCOINCRYPTOSWAPNG) deployGauge(curve, 'TWOCRYPTONG', 'MAINNETGAUGE')
      if (currentPoolType === THREECOINCRYPTOSWAP) deployGauge(curve, 'THREECRYPTO', 'MAINNETGAUGE')
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
      <StyledButton variant="filled" onClick={() => connectWallet()} loading={isLoading(connectState)}>
        {t`Connect Wallet`}
      </StyledButton>
    ) : (
      <>
        {sidechainNav === 0
          ? deploymentStatus.sidechain.transaction &&
            deploymentStatus.sidechain.status === 'SUCCESS' && (
              <InfoLinkBarWrapper>
                <StyledInfoLinkBar
                  description={t`Tx: Gauge for ${shortenAddress(lpTokenAddress)} deployed`}
                  link={scanTxPath(networks[chainId], deploymentStatus.sidechain.transaction.hash)}
                />
              </InfoLinkBarWrapper>
            )
          : deploymentStatus.mirror.transaction &&
            deploymentStatus.mirror.status === 'SUCCESS' && (
              <InfoLinkBarWrapper>
                <StyledInfoLinkBar
                  description={t`Tx: Gauge for ${shortenAddress(lpTokenAddress)} deployed`}
                  link={scanTxPath(networks[chainId], deploymentStatus.mirror.transaction.hash)}
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
    <StyledButton variant="filled" onClick={() => connectWallet()} loading={isLoading(connectState)}>
      {t`Connect Wallet`}
    </StyledButton>
  ) : (
    <>
      {deploymentStatus.mainnet.transaction && deploymentStatus.mainnet.status === 'SUCCESS' && (
        <InfoLinkBarWrapper>
          <StyledInfoLinkBar
            description={t`Tx: Gauge for ${shortenAddress(lpTokenAddress)} deployed`}
            link={scanTxPath(networks[chainId], deploymentStatus.mainnet.transaction.hash)}
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
