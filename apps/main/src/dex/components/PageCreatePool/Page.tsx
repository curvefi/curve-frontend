'use client'
import styled from 'styled-components'
import { useAccount } from 'wagmi'
import PoolCreation from '@/dex/components/PageCreatePool/index'
import { CurveApi, type NetworkUrlParams } from '@/dex/types/main.types'
import Box from '@ui/Box'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'

export const PageCreatePool = (_: NetworkUrlParams) => {
  const { lib: curve = null, connectState } = useConnection<CurveApi>()
  const { connect: connectWallet } = useWallet()
  const { address } = useAccount()

  if (address) {
    return (
      <Container>
        <PoolCreation curve={curve as CurveApi} />
      </Container>
    )
  }
  return (
    <Box display="flex" fillWidth>
      <ConnectWalletWrapper>
        <ConnectWalletPrompt
          description="Connect wallet to access pool creation"
          connectText="Connect Wallet"
          loadingText="Connecting"
          connectWallet={() => connectWallet()}
          isLoading={isLoading(connectState)}
        />
      </ConnectWalletWrapper>
    </Box>
  )
}

const Container = styled.div`
  margin: 0 auto;
  max-width: var(--width);
  min-height: 50vh;

  @media (min-width: 46.875rem) {
    margin: 1.5rem 0;
  }

  @media (min-width: ${breakpoints.lg}rem) {
    margin: 1.5rem;
  }
`

const ConnectWalletWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  margin: var(--spacing-3) auto;
`
