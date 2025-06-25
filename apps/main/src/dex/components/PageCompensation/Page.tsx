'use client'
import { Contract, Interface } from 'ethers'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import FormCompensation from '@/dex/components/PageCompensation/index'
import type { EtherContract } from '@/dex/components/PageCompensation/types'
import { useChainId } from '@/dex/hooks/useChainId'
import Settings from '@/dex/layout/default/Settings'
import { type NetworkUrlParams, Provider } from '@/dex/types/main.types'
import Box, { BoxHeader } from '@ui/Box'
import Button from '@ui/Button'
import IconButton from '@ui/IconButton'
import ExternalLink from '@ui/Link/ExternalLink'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const PageCompensation = ({ network }: NetworkUrlParams) => {
  const { curveApi = null, connectState } = useConnection()
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
    if (!isLoading(connectState) && provider) {
      void fetchData(provider)
    }
  }, [fetchData, connectState, provider])

  return (
    <>
      <Container variant="primary" shadowed>
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
              <Button
                fillWidth
                loading={isLoading(connectState)}
                size="large"
                variant="filled"
                onClick={() => connectWallet()}
              >
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
            Please note: wETH and alETH are distributed immediately, whereas CRV (from the community fund) will be
            vested or distributed linearly over a one-year period.
          </i>
        </Content>
      </Container>
      <Settings showScrollButton />
    </>
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
