import type { TableCellProps, TableRowProps } from '@/components/PageMarketList/types'

import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { CellInPool } from '@/ui/Table'
import Box from '@/ui/Box'
import CellToken from '@/components/SharedCellData/CellToken'
import CellMaxLeverage from '@/components/SharedCellData/CellMaxLeverage'
import IconButton from '@/ui/IconButton'
import Icon from '@/ui/Icon'
import ListInfoItem, { ListInfoItems } from '@/ui/ListInfo'

type Props = TableRowProps & {
  cellProps: TableCellProps
  isHideDetail: boolean
  showMyVaultCell: boolean
  setShowDetail: (value: ((prevState: string) => string) | string) => void
}

const TableRowMobileHead = ({
  cellProps,
  filterTypeKey,
  isHideDetail,
  owmId,
  loanExists,
  showMyVaultCell,
  handleCellClick,
  setShowDetail,
}: Props) => {
  const showInMarket = filterTypeKey === 'borrow' ? loanExists : showMyVaultCell

  return (
    <Box grid gridTemplateColumns={showInMarket ? '20px 1fr' : '1fr'}>
      {showInMarket && <CellInPool as="div" isMobile isIn type="market" />}
      <Box grid gridTemplateColumns="1fr auto" fillWidth padding="var(--spacing-1) 0 0 var(--spacing-2)">
        <Box onClick={() => handleCellClick()}>
          <StyledTokens>
            {filterTypeKey === 'borrow' ? (
              <StyledToken title={t`Collateral`}>
                <CellToken {...cellProps} type="collateral" module="borrow" />
              </StyledToken>
            ) : (
              <StyledToken title={t`Lend`}>
                <CellToken {...cellProps} type="borrowed" module="supply" />
              </StyledToken>
            )}
            {filterTypeKey === 'borrow' ? (
              <StyledToken title={t`Borrow`}>
                <CellToken {...cellProps} type="borrowed" module="borrow" />
              </StyledToken>
            ) : (
              <StyledToken title={t`Collateral`}>
                <CellToken {...cellProps} type="collateral" module="supply" />
              </StyledToken>
            )}
          </StyledTokens>
          <CellMaxLeverage {...cellProps} showTitle size="sm" />
        </Box>
        <IconButton onClick={() => setShowDetail((prevState) => (prevState === owmId ? '' : owmId))}>
          {isHideDetail ? <Icon name="ChevronDown" size={16} /> : <Icon name="ChevronUp" size={16} />}
        </IconButton>
      </Box>
    </Box>
  )
}

const StyledTokens = styled(ListInfoItems)`
  display: grid;
  grid-template-columns: 1fr 1fr;
`

const StyledToken = styled(ListInfoItem)`
  margin-bottom: var(--spacing-1);
`

export default TableRowMobileHead
