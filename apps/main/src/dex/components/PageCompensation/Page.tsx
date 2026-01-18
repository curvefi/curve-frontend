import { Contract, Interface } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { FormCompensation } from '@/dex/components/PageCompensation/index'
import type { EtherContract } from '@/dex/components/PageCompensation/types'
import { useChainId } from '@/dex/hooks/useChainId'
import { type NetworkUrlParams, Provider } from '@/dex/types/main.types'
import { BoxHeader, Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { IconButton } from '@ui/IconButton'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { isLoading, useCurve, useWallet } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

export const PageCompensation = () => {
  const { network } = useParams<NetworkUrlParams>()
  const { curveApi = null, connectState } = useCurve()
  const isConnecting = isLoading(connectState)
  const { connect: connectWallet, provider } = useWallet()
  const [contracts, setContracts] = useState<EtherContract[]>([])
  const rChainId = useChainId(network)

  const fetchData = useCallback(async (provider: Provider) => {
    const signer = await provider.getSigner()
    const contracts = await import('@/dex/components/PageCompensation/abis').then((modules) =>
      Object.values(modules).map(({ contractAddress, abi, ...rest }) => ({
        ...rest,
        contractAddress,
        contract: new Contract(contractAddress, new Interface(abi).format(), signer),
      })),
    )
    setContracts(contracts)
  }, [])

  // get initial data
  useEffect(() => {
    if (!isConnecting && provider) {
      void fetchData(provider)
    }
  }, [fetchData, isConnecting, provider])

  return (
    <Container variant="primary" shadowed data-testid="compensation-page">
      <BoxHeader className="title-text">
        <IconButton hidden />
        {t`Compensation`}
        <IconButton hidden />
      </BoxHeader>

      <Content grid gridRowGap={3} padding>
        {rChainId !== 1 ? (
          <strong>
            <i>Claimable compensation is only available on Ethereum network.</i>
          </strong>
        ) : !provider ? (
          <>
            <strong>Please connect your wallet to view compensation</strong>
            <Button fillWidth loading={isConnecting} size="large" variant="filled" onClick={() => connectWallet()}>
              {t`Connect Wallet`}
            </Button>
          </>
        ) : !rChainId || contracts.length === 0 ? (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        ) : (
          <FormCompensation curve={curveApi} rChainId={rChainId} contracts={contracts} provider={provider} />
        )}
        <i>
          For additional information, please see{' '}
          <ExternalLink $noStyles href="https://github.com/curvefi/vest-split/?tab=readme-ov-file#deployed-splitters">
            Github
          </ExternalLink>{' '}
          or{' '}
          <ExternalLink
            $noStyles
            href="https://gov.curve.finance/t/proposal-to-recompensate-lps-affected-by-curve-pool-exploit/9825"
          >
            gov.curve.finance
          </ExternalLink>
        </i>
        <i>
          Please note: wETH and alETH are distributed immediately, whereas CRV (from the community fund) will be vested
          or distributed linearly over a one-year period.
        </i>
      </Content>
    </Container>
  )
}

const Container = styled(Box)`
  margin: 1.5rem auto;
  max-width: var(--transfer-min-width);
  width: 100%;
`

const Content = styled(Box)`
  align-content: flex-start;
  min-height: 14.8125rem; //237px
`
