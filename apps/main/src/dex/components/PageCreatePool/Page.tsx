import { styled } from 'styled-components'
import { CreatePool as PoolCreation } from '@/dex/components/PageCreatePool/index'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'

export const PageCreatePool = () => {
  const { provider, curveApi = null } = useCurve()
  if (provider && curveApi) {
    return (
      <Container data-testid="create-pool-page">
        <PoolCreation curve={curveApi} />
      </Container>
    )
  }
  return <ConnectWalletPrompt description="Connect wallet to access pool creation" testId="create-pool-page" />
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
