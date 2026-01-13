import { styled } from 'styled-components'
import { RCCircle } from '@ui/images'

export const RouteLine = () => (
  <RouteTravelDecor>
    <CircleIcon />
    <RouteTravelBar></RouteTravelBar>
    <CircleIcon />
  </RouteTravelDecor>
)

const RouteTravelBar = styled.div`
  border-left: 2px dotted;
  margin: -1px 0 -3px 3px;
  height: 100%;
  opacity: 0.5;
`

const CircleIcon = styled(RCCircle)`
  width: 0.5rem;
  height: 0.5rem;
  fill: currentColor;
`

const RouteTravelDecor = styled.div`
  height: calc(100% - 44px);
  margin-left: var(--spacing-1);
  opacity: 0.7;
`
