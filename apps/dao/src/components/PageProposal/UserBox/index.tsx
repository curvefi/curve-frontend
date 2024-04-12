import styled from 'styled-components'
import { useConnectWallet } from '@/onboard'
import { t } from '@lingui/macro'

import { shortenTokenAddress, formatNumber } from '@/ui/utils'
import ExternalLink from '@/ui/Link/ExternalLink'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import Button from '@/ui/Button'

const UserBox = () => {
  const [{ wallet }] = useConnectWallet()
  const { userAddress, userEns, userVeCrv } = useStore((state) => state.user)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  return (
    <Wrapper variant="secondary">
      {wallet ? (
        <>
          <SubTitle>User information</SubTitle>
          <StyledExternalLink href={`https://etherscan.io/address/${userAddress}`}>
            <Box flex>
              {userEns ? (
                <UserIdentifier>{userEns}</UserIdentifier>
              ) : (
                <UserIdentifier>{shortenTokenAddress(userAddress ?? '')}</UserIdentifier>
              )}
              <Icon name="Launch" size={16} />
            </Box>
            {userEns && <SmallAddress>{shortenTokenAddress(userAddress ?? '')}</SmallAddress>}
          </StyledExternalLink>

          <Column>
            <SubTitle>Voting power:</SubTitle>
            <p>{formatNumber(userVeCrv.veCrv)} veCRV</p>
          </Column>
        </>
      ) : (
        <StyledButton variant="outlined" onClick={updateConnectWalletStateKeys}>
          {t`Connect Wallet`}
        </StyledButton>
      )}
    </Wrapper>
  )
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-weight: 500;
  text-decoration: none;
  text-transform: none;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-2);
`

const UserIdentifier = styled.h4`
  margin-right: var(--spacing-1);
`

const SmallAddress = styled.p`
  font-size: var(--font-size-1);
  font-weight: var(--bold);
  opacity: 0.7;
`

const SubTitle = styled.h4`
  font-size: var(--font-size-1);
  opacity: 0.5;
`

const Wrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-size: var(--font-size-2);
  font-weight: var(--semi-bold);
  padding: var(--spacing-3);
  margin-bottom: var(--spacing-1);
`

const StyledButton = styled(Button)`
  padding: var(--spacing-2) var(--spacing-5);
  display: flex;
  margin: 0 auto 0;
  justify-content: center;
  &.success {
    color: var(--success-400);
    border: 2px solid var(--success-400);
    background-color: var(--success-600);
  }
`

export default UserBox
