import React from 'react'
import styled from 'styled-components'

import useCollateralAlert from '@/loan/hooks/useCollateralAlert'

import { TooltipAlert as AlertTooltipIcon } from '@ui/Tooltip'
import Box from '@ui/Box'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { CollateralData, CollateralDataCache } from '@/loan/types/loan.types'

type Props = {
  className?: string
  blockchainId: string
  collateralDataCachedOrApi: CollateralDataCache | CollateralData | undefined
  minHeight?: number
  type: 'collateral' | 'borrow'
  showAlert?: boolean
  size?: 'lg'
  onClick?: () => void
}

const TokenLabel = ({
  className,
  blockchainId,
  collateralDataCachedOrApi,
  minHeight,
  showAlert,
  type,
  size,
  onClick,
}: Props) => {
  const collateralAlert = useCollateralAlert(collateralDataCachedOrApi?.llamma?.address)

  const { coins, coinAddresses } = collateralDataCachedOrApi?.llamma ?? {}
  const symbol = coins?.[type === 'collateral' ? 1 : 0] ?? ''
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
        <TooltipIconWrapper>
          <AlertTooltipIcon minWidth="300px" placement="start" {...collateralAlert}>
            {collateralAlert.message}
          </AlertTooltipIcon>
        </TooltipIconWrapper>
      )}
      <TokenIcon blockchainId={blockchainId} symbol={symbol} address={tokenAddress} />{' '}
      <Label size={size}>{symbol}</Label>
    </Wrapper>
  )
}

const Wrapper = styled(Box)<{ $minHeight?: number }>`
  ${({ $minHeight }) => typeof $minHeight !== 'undefined' && `min-height: ${$minHeight}px; gap: 0.25rem`};
`

const Label = styled.strong<Pick<Props, 'size'>>`
  padding-left: var(--spacing-1);
  ${({ size }) => size === 'lg' && `font-size: var(--font-size-4);`}
`

/**
 * Vertically aligns the tooltip icon. Not part of the tooltip icon itself as it messes up
 * when used elsewhere, so it's just specific for this instance. Will most likely be
 * replaced in the future, so good enough for now.
 */
const TooltipIconWrapper = styled(Box)`
  > span {
    display: flex;
  }
`

export default TokenLabel
