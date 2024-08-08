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
  type: 'collateral' | 'borrow'
  showAlert?: boolean
}

const TokenLabel = ({ className, rChainId, collateralDataCachedOrApi, showAlert, type }: Props) => {
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
      <TokenIcon imageBaseUrl={getImageBaseUrl(rChainId)} token={token} address={tokenAddress} /> <Label>{token}</Label>
    </Box>
  )
}

const Label = styled.strong`
  padding-left: var(--spacing-1);
`

export default TokenLabel
