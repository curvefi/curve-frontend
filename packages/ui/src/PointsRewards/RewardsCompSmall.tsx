import styled from 'styled-components'
import Image from 'next/image'

import Tooltip from 'ui/src/Tooltip'

type Props = {
  description: string
  multiplier: string
  tokenAddress: string
  imgSrc: string
}

const RewardsCompSmall: React.FC<Props> = ({ description, multiplier, tokenAddress, imgSrc }) => {
  return (
    <Tooltip tooltip={<p>{description}</p>}>
      <Wrapper>
        <TokenIcon src={imgSrc} alt={tokenAddress} width={20} height={20} />
        <Multiplier>{`${multiplier}x`}</Multiplier>
      </Wrapper>
    </Tooltip>
  )
}

export default RewardsCompSmall

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
`

const TokenIcon = styled(Image)`
  border: 1px solid transparent;
  border-radius: 50%;
`

const Multiplier = styled.p`
  text-transform: uppercase;
  font-size: var(--font-size-3);
  font-weight: var(--semi-bold);
`
