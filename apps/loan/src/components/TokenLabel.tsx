import Box from '@/ui/Box'
import AlertTooltipIcon from '@/ui/Tooltip/TooltipAlert'
import React from 'react'
import styled from 'styled-components'

import TokenIcon from '@/components/TokenIcon'
import useCollateralAlert from '@/hooks/useCollateralAlert'
import { getImageBaseUrl } from '@/utils/utilsCurvejs'


type Props = {
  className?: string
  rChainId: ChainId
  collateralDataCachedOrApi: CollateralDataCache | CollateralData | undefined
  type: 'collateral' | 'borrow'
  showAlert?: boolean
  size?: 'lg'
}

const TokenLabel = ({ className, rChainId, collateralDataCachedOrApi, showAlert, type, size }: Props) => {
  const collateralAlert = useCollateralAlert(collateralDataCachedOrApi?.llamma?.address)

  const { coins, coinAddresses } = collateralDataCachedOrApi?.llamma ?? {}
  const token = coins?.[type === 'collateral' ? 1 : 0] ?? ''
  const tokenAddress = coinAddresses?.[type === 'collateral' ? 1 : 0] ?? ''

  return (
    <Box flex flexAlignItems="center" className={className}>
      {showAlert && collateralAlert?.isDeprecated && (
        <AlertTooltipIcon minWidth="300px" placement="start" {...collateralAlert}>
          {collateralAlert.message}
        </AlertTooltipIcon>
      )}
      <TokenIcon imageBaseUrl={getImageBaseUrl(rChainId)} token={token} address={tokenAddress} />{' '}
      <Label size={size}>{token}</Label>
    </Box>
  )
}

const Label = styled.strong<Pick<Props, 'size'>>`
  padding-left: var(--spacing-1);
  ${({ size }) => size === 'lg' && `font-size: var(--font-size-4);`}
`

export default TokenLabel
