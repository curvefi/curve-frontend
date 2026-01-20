import { styled } from 'styled-components'

type Props = {
  className?: string
  $height?: string
  progress: number
}

export const ProgressBar = ({ className = '', $height, progress = 0 }: Props) => (
  <Wrapper className={className ?? ''}>
    <Bar $height={$height} $width={progress}></Bar>
  </Wrapper>
)

const Wrapper = styled.div`
  border: 1px solid var(--border-400);
`

const Bar = styled.div<{ $height?: string; $width: number }>`
  background-color: var(--button--background-color);
  height: ${({ $height }) => `${$height ?? `17px`};`};
  width: ${({ $width }) => `${$width ?? 0}%;`};
`
