import React from 'react'
import styled from 'styled-components'

import { getImageBaseUrl } from '@/utils/utilsCurvejs'
import useCollateralAlert from '@/hooks/useCollateralAlert'

import AlertTooltipIcon from '@/ui/Tooltip/TooltipAlert'
import Box from '@/ui/Box'
import CollateralLabelNameAddress from '@/components/CollateralLabelNameAddress'
import TokenIcons from '@/components/TokenIcons'

type Props = {
  className?: string
  chainId: ChainId
  isVisible?: boolean
  collateralData: CollateralDataCache | CollateralData | undefined
  tableListProps?: {
    onClick?: () => void
  }
}

const CollateralLabel = ({ className, chainId, isVisible, collateralData, tableListProps }: Props) => {
  const collateralAlert = useCollateralAlert(collateralData?.llamma?.address)
  const { collateral = '', collateralSymbol = '' } = collateralData?.llamma ?? {}

  const handleClick = () => {
    if (typeof tableListProps?.onClick === 'function') {
      tableListProps.onClick()
    }
  }

  return (
    <Wrapper className={className} onClick={handleClick}>
      <IconsWrapper>
        {isVisible && (
          <TokenIcons
            imageBaseUrl={getImageBaseUrl(chainId)}
            tokens={[collateralSymbol]}
            tokenAddresses={[collateral]}
          />
        )}
      </IconsWrapper>
      <div>
        <Box flex flexAlignItems="center">
          {collateralAlert?.isDeprecated && (
            <AlertTooltipIcon minWidth="300px" placement="start" {...collateralAlert}>
              {collateralAlert.message}
            </AlertTooltipIcon>
          )}
          {collateral && (
            <CollateralLabelNameAddress
              displayAddress={collateral}
              displayName={collateralData?.displayName || collateralSymbol}
              isHighlightName={false}
              isHighlightAddress={false}
            />
          )}
        </Box>
      </div>
    </Wrapper>
  )
}

CollateralLabel.defaultProps = {
  className: '',
  isVisible: true,
}

const IconsWrapper = styled.div`
  min-width: 2.3125rem;
`

const Wrapper = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr;
  //grid-column-gap: var(--spacing-2);
  width: 100%;
`

export default CollateralLabel
