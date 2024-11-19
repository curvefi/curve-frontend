import React from 'react'
import styled from 'styled-components'

import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import useCollateralAlert from '@/hooks/useCollateralAlert'

import AlertTooltipIcon from '@/ui/Tooltip/TooltipAlert'
import Box from '@/ui/Box'
import TokenIcon from '@/components/TokenIcon'

type Props = {
  className?: string
  rChainId: ChainId
  collateralDataCachedOrApi: CollateralDataCache | CollateralData | undefined
  minHeight?: number
  type: 'collateral' | 'borrow'
  showAlert?: boolean
  size?: 'lg'
  onClick?: () => void
}

const TokenLabel = ({
  className,
  rChainId,
  collateralDataCachedOrApi,
  minHeight,
  showAlert,
  type,
  size,
  onClick,
}: Props) => {
  const collateralAlert = useCollateralAlert(collateralDataCachedOrApi?.llamma?.address)

  const { coins, coinAddresses } = collateralDataCachedOrApi?.llamma ?? {}
  const token = coins?.[type === 'collateral' ? 1 : 0] ?? ''
  const tokenAddress = coinAddresses?.[type === 'collateral' ? 1 : 0] ?? ''

  return (
    <Wrapper
      flex
      flexAlignItems="center"
      className={className}
      $minHeight={minHeight}
      {...(typeof onClick === 'function' ? { onClick } : {})}
    >
      {showAlert && collateralAlert?.isDeprecated && (
        <AlertTooltipIcon minWidth="300px" placement="start" {...collateralAlert}>
          {collateralAlert.message}
        </AlertTooltipIcon>
      )}
      <TokenIcon imageBaseUrl={getImageBaseUrl(rChainId)} token={token} address={tokenAddress} />{' '}
      <Label size={size}>{token}</Label>
    </Wrapper>
  )
}

const Wrapper = styled(Box)<{ $minHeight?: number }>`
  ${({ $minHeight }) => typeof $minHeight !== 'undefined' && `min-height: ${$minHeight}px;`};
`

const Label = styled.strong<Pick<Props, 'size'>>`
  padding-left: var(--spacing-1);
  ${({ size }) => size === 'lg' && `font-size: var(--font-size-4);`}
`

export default TokenLabel
