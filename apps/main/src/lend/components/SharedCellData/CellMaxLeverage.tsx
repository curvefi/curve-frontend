import type { ChipProps } from '@ui/Typography/types'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import { formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'
import Chip from '@ui/Typography/Chip'
import TextCaption from '@ui/TextCaption'
import { ChainId } from '@/lend/types/lend.types'

const CellMaxLeverage = ({
  className = '',
  rChainId,
  rOwmId,
  showTitle,
  ...props
}: ChipProps & {
  className?: string
  rChainId: ChainId
  rOwmId: string
  showTitle?: boolean
}) => {
  const maxLeverageResp = useStore((state) => state.markets.maxLeverageMapper[rChainId]?.[rOwmId])

  const { maxLeverage, error } = maxLeverageResp ?? {}

  return (
    <>
      {typeof maxLeverageResp === 'undefined' || maxLeverage === '' ? null : error ? (
        '?'
      ) : (
        <StyledChip {...props} $isMarginTop={showTitle}>
          {showTitle ? (
            <TextCaption isBold isCaps>
              {t`Leverage:`}{' '}
            </TextCaption>
          ) : (
            ''
          )}
          up to x{formatNumber(maxLeverage, { maximumSignificantDigits: 2 })}🔥
        </StyledChip>
      )}
    </>
  )
}

const StyledChip = styled(Chip)<{ $isMarginTop?: boolean }>`
  white-space: nowrap;
  ${({ $isMarginTop }) => {
    if ($isMarginTop) {
      return `
        display: inline-block;
        margin-top: var(--spacing-2);
        margin-bottom: var(--spacing-1);
      `
    }
  }}
`

export default CellMaxLeverage
