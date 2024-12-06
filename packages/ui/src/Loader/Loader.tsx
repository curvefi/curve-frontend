import * as React from 'react'
import styled, { keyframes } from 'styled-components'

type Props = {
  className?: string
  isLightBg?: boolean
  skeleton?: [number, number]
}

const Loader = ({ className, isLightBg = false, skeleton = [12, 12], ...props }: Props) => (
  <TextSkeleton className={className} isLightBg={isLightBg} skeleton={skeleton} {...props} />
)

const AnimateShimmer = keyframes`
  100% { transform: translateX(100%); }
`

interface TextSkeletonProps extends Pick<Props, 'isLightBg' | 'skeleton'> {}

const TextSkeleton = styled.span<TextSkeletonProps>`
  display: inline-block;
  position: relative;
  overflow: hidden;

  ${({ skeleton }) => {
    if (skeleton) {
      return `
        height: ${skeleton[1]}px;
        width: ${skeleton[0]}px;
      `
    }
  }}

  ${({ isLightBg }) =>
    isLightBg
      ? `background-color: var(--skeleton_light--background-color);`
      : `background-color: var(--skeleton--background-color);`}

  

  :after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    transform: translateX(-100%);
    animation: ${AnimateShimmer} 2s infinite;

    ${({ isLightBg }) =>
      isLightBg
        ? `background-image: var(--skeleton_light--background-image);`
        : `background-image: var(--skeleton--background-image);`}
`

export default Loader
