import styled from 'styled-components'
import Image from 'next/image'

import Tooltip from 'ui/src/Tooltip'

type Props = {
  platform: string
  description: string
  multiplier: string
  imgSrc: string
}

const RewardsCompSmall: React.FC<Props> = ({ platform, description, multiplier, imgSrc }) => {
  return (
    <Tooltip tooltip={<TooltipParagraph>{description}</TooltipParagraph>} minWidth={'170px'}>
      <Container>
        <TokenIcon src={imgSrc} alt={platform} width={16} height={16} />
        <Multiplier>{`${multiplier}x`}</Multiplier>
      </Container>
    </Tooltip>
  )
}

export default RewardsCompSmall

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1);
  border: 1px solid var(--gray-500a25);
`

const TokenIcon = styled(Image)`
  border: 1px solid transparent;
  border-radius: 50%;
`

const Multiplier = styled.p`
  text-transform: uppercase;
  font-size: var(--font-size-3);
`

const TooltipParagraph = styled.p`
  text-align: left;
`
