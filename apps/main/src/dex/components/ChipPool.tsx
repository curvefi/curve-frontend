import { useMemo, useRef } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { styled } from 'styled-components'
import { getAddress } from 'viem'
import { ROUTE } from '@/dex/constants'
import type { NetworkEnum } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { Icon } from '@ui/Icon'
import { TextEllipsis } from '@ui/TextEllipsis'
import { breakpoints } from '@ui/utils/responsive'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { copyToClipboard, shortenAddress } from '@ui-kit/utils'

interface ButtonProps extends AriaButtonProps {
  className?: string
}

const Button = ({ className, ...props }: ButtonProps) => {
  const ref = useRef(null)
  const { buttonProps, isPressed } = useButton(props, ref)
  const { children } = props
  return (
    <ChipPoolCopyButton className={`${className} ${isPressed ? 'isPressed' : ''}`} {...buttonProps} ref={ref}>
      {children}
    </ChipPoolCopyButton>
  )
}

const ChipPoolCopyButton = styled.button`
  margin-right: 2px;
  color: inherit;
  background: transparent;
  cursor: pointer;

  &.isPressed {
    color: white;
    background-color: var(--primary-400);
  }
`

interface ChipPoolProps {
  poolId: string
  poolName: string
  poolAddress: string
}

export const ChipPool = ({ poolId, poolName, poolAddress }: ChipPoolProps) => {
  const network = useCurve().network?.id as NetworkEnum
  const parsedPoolAddress = useMemo(() => {
    if (poolAddress) {
      return `${shortenAddress(poolAddress)}`
    }
    return getAddress(poolAddress)
  }, [poolAddress])

  return (
    <ChipPoolWrapper>
      <ChipPoolName>
        <RouterLink
          href={getPath({ network }, `${ROUTE.PAGE_POOLS}/${encodeURIComponent(poolId)}${ROUTE.PAGE_POOL_DEPOSIT}`)}
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold',
          }}
        >
          {poolName}
        </RouterLink>{' '}
      </ChipPoolName>
      <ChipPoolAdditionalInfo>
        <Button onPress={() => copyToClipboard(poolAddress)}>
          <ChipPoolAddress>{parsedPoolAddress}</ChipPoolAddress>
          <ChipPoolCopyButtonIcon name="Copy" size={16} />
        </Button>
      </ChipPoolAdditionalInfo>
    </ChipPoolWrapper>
  )
}

const ChipPoolAdditionalInfo = styled.span`
  align-items: center;
  display: inline-flex;
  max-width: 0;
  transition: max-width 1s;
  white-space: nowrap;
  overflow: hidden;
  margin-left: 4px;
`

const ChipPoolWrapper = styled.span`
  display: inherit;
  min-height: 21px;
  border: 1px solid transparent;

  &:hover {
    border-color: lightgray;

    ${ChipPoolAdditionalInfo} {
      max-width: 18.75rem; // 300px
    }
  }
`

const ChipPoolAddress = styled.span`
  margin-right: 2px;
  font-family: var(--font-mono);
  font-size: var(--font-size-2);
`

const ChipPoolName = styled(TextEllipsis)`
  font-size: var(--font-size-4);

  max-width: min(13.125rem, 100vw - 140px); // 210px, but smaller in very small viewports to avoid horizontal scroll

  @media (min-width: ${breakpoints.sm}rem) {
    font-size: 1.25rem; // 20px
    max-width: 16.25rem; // 260px
  }
  @media (min-width: ${breakpoints.lg}rem) {
    max-width: 16.25rem; // 260px
  }
`

const ChipPoolCopyButtonIcon = styled(Icon)`
  position: relative;
  top: 2px;
`
