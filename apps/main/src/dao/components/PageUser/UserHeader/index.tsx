import styled from 'styled-components'
import { getAddress } from 'viem'
import { TOP_HOLDERS } from '@/dao/constants'
import networks from '@/dao/networks'
import { UserMapper } from '@/dao/types/dao.types'
import { copyToClipboard } from '@/dao/utils'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import { ExternalLink } from '@ui/Link'

interface UserHeaderProps {
  userAddress: string
  userMapper: UserMapper
}

const UserHeader = ({ userAddress, userMapper }: UserHeaderProps) => {
  const user = userMapper[userAddress]

  const handleCopyClick = (address: string) => {
    copyToClipboard(address)
  }

  return (
    <Wrapper variant="secondary">
      <Box flex flexAlignItems="center">
        <Box flex flexColumn flexJustifyContent="center">
          <h3>{TOP_HOLDERS[userAddress]?.title || user?.ens || getAddress(userAddress)}</h3>
          {((TOP_HOLDERS[userAddress]?.title && userAddress) || (user?.ens && userAddress)) && (
            <Box flex flexAlignItems="center">
              <UserAddress>{getAddress(userAddress)}</UserAddress>{' '}
              <Box margin="0 0 0 var(--spacing-1)" flex>
                <StyledCopyButton size="small" onClick={() => handleCopyClick(userAddress)}>
                  <Icon name="Copy" size={16} />
                </StyledCopyButton>
                <StyledExternalLink size="small" href={networks[1].scanAddressPath(userAddress)}>
                  <Icon name="Launch" size={16} />
                </StyledExternalLink>
              </Box>
            </Box>
          )}
        </Box>
        {!userMapper[userAddress]?.ens && !TOP_HOLDERS[userAddress]?.title && (
          <Box flex margin="0 0 0 var(--spacing-1)">
            <StyledCopyButton size="small" onClick={() => handleCopyClick(userAddress)}>
              <Icon name="Copy" size={16} />
            </StyledCopyButton>
            <StyledExternalLink size="small" href={networks[1].scanAddressPath(userAddress)}>
              <Icon name="Launch" size={16} />
            </StyledExternalLink>
          </Box>
        )}
      </Box>
    </Wrapper>
  )
}

const Wrapper = styled(Box)`
  padding: var(--spacing-3);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3);
  background-color: var(--box_header--secondary--background-color);
`

const StyledCopyButton = styled(IconButton)`
  &:hover {
    color: var(--button_icon--hover--color);
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

const StyledExternalLink = styled(ExternalLink)`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  opacity: 0.6;
  &:hover {
    color: var(--button_icon--hover--color);
    opacity: 1;
  }
  &:active {
    color: white;
    background-color: var(--primary-400);
  }
`

const UserAddress = styled.p`
  line-break: anywhere;
`

export default UserHeader
