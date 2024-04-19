import { FunctionComponent, HTMLAttributes, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'

type Props = {
  defaultHeight: string
} & HTMLAttributes<HTMLTableRowElement>

/**
 * Component to lazy load the <Item> table row when it is visible in the viewport.
 */
const LazyItem: FunctionComponent<Props> = ({ children, id, style, ...props }) => {
  const ref = useRef<HTMLTableRowElement>(null)
  const { isIntersecting: isVisible } = useIntersectionObserver(ref) ?? {}

  // when rendered items might get larger. So we have that in the state to avoid stuttering
  const [height, setHeight] = useState<string>('88px') // default height on desktop
  useEffect(() => {
    if (isVisible && ref.current) {
      setHeight(`${ref.current.clientHeight}px`)
    }
  }, [isVisible])

  return (
    <Item ref={ref} id={id} style={{ ...style, ...(!isVisible && { height }) }} {...props}>
      {isVisible && children}
    </Item>
  )
}

const Item = styled.div``

export default LazyItem
