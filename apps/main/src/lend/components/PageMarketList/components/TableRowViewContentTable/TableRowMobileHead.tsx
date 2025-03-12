import styled from 'styled-components'
import type { TableCellProps, TableRowProps } from '@/lend/components/PageMarketList/types'
import CellMaxLeverage from '@/lend/components/SharedCellData/CellMaxLeverage'
import CellToken from '@/lend/components/SharedCellData/CellToken'
import Box from '@ui/Box'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ListInfoItem, { ListInfoItems } from '@ui/ListInfo'
import { CellInPool } from '@ui/Table'
import { t } from '@ui-kit/lib/i18n'

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
      {showInMarket && (
        <CellInPool as="div" isMobile isIn type="market" tooltip={t`You have a balance in this market`} />
      )}
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
          <Icon name={isHideDetail ? 'ChevronDown' : 'ChevronUp'} size={16} />
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
