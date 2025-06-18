import { Dispatch, SetStateAction } from 'react'
import styled from 'styled-components'
import { DetailsButton } from '@/lend/components/DetailInfoLeverageAdvancedExpected'
import type { DetailInfoLeverageExpectedProps } from '@/lend/components/DetailInfoLeverageAdvancedExpected/types'
import { format } from '@/lend/components/DetailInfoLeverageAdvancedExpected/utils'
import Icon from '@ui/Icon'
import Loader from '@ui/Loader'

const ExpectedLabel = ({
  loading,
  label,
  total,
  swapToSymbol,
  showDetails,
  toggleShowDetails,
}: Pick<DetailInfoLeverageExpectedProps, 'loading' | 'total'> & {
  label: string
  showDetails: boolean
  swapToSymbol: string
  toggleShowDetails: Dispatch<SetStateAction<boolean>>
}) => (
  <Label>
    <strong>{label}:</strong>
    <span>
      {loading ? (
        <Loader skeleton={[80, 18]} />
      ) : (
        <strong>
          {format(total, { defaultValue: '-' })} {swapToSymbol}
        </strong>
      )}
      <DetailsButton $isOpen={showDetails} variant="outlined" onClick={() => toggleShowDetails((prev) => !prev)}>
        Details {showDetails ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
      </DetailsButton>
    </span>
  </Label>
)

const Label = styled.h3`
  align-items: center;
  display: flex;
  font-size: var(--font-size-2);
  justify-content: space-between;
  padding-top: var(--spacing-1);

  > span:last-of-type {
    align-items: center;
    display: inline-flex;
  }
`

export default ExpectedLabel
