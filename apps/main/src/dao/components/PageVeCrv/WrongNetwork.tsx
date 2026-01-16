import { styled } from 'styled-components'
import { ConnectEthereum } from '@/dao/components/ConnectEthereum'
import { Box } from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

export const WrongNetwork = () => (
  <Box
    flex
    flexGap="1rem"
    flexAlignItems="center"
    flexJustifyContent="center"
    flexDirection="column"
    margin="1.5rem auto"
  >
    <WrongNetworkMessage>{t`Interacting with veCRV is only available on Ethereum Mainnet.`}</WrongNetworkMessage>
    <ConnectEthereum />
  </Box>
)

const WrongNetworkMessage = styled.p`
  font-size: var(--font-size-2);
  max-width: 16rem;
  text-align: center;
`
